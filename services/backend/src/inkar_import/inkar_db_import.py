import os
from os import getenv
import traceback
import xml.etree.ElementTree as ET
import psycopg2
import pandas
import logging
import sys
import pandas as pd

# configuration for database
dbConfig = {
    'host': getenv('POSTGRES_HOST', 'localhost'),
    'port': getenv('POSTGRES_PORT', 5432),
    'dbname': getenv('POSTGRES_DB', 'brandenburg'),
    'user': getenv('POSTGRES_USER', 'postgres'),
    'password': getenv('POSTGRES_PASSWORD', '1234')
}

logger = logging.getLogger("INKAR Importer")    

archive_dir = os.getenv('DEMOGRAPHIC_DATA_FILES_PATH', 'C:\\innowest\\data\\archive\\')
config_path = "/app/src/inkar_import/config.xml"
#config_path = "config.xml" #TJM250411 for debugging

# function for capturing stderr console output to save in log
def stderr_handler(type, value, tb):
    logger.error(''.join(traceback.format_exception(type, value, tb)))

# redirect error output to log instead of console
sys.excepthook = stderr_handler


# Wrapper function taking an InkarProcess object
def db_import(my): # my : InkarProcess
    importInkar(dir = my.archive_dir,
                key = my.key_table)
    my.key_table['import.successful', my.current_key_entry] = True
    my.key_save()


#### The central function ####
def importInkar(dir = archive_dir, key = "key.csv", key_file_row = "auto"):
    logger.info('Started')

    # if "key" is a string, we will assume it is the path for the key file, otherwise we will assume it is a data frame with the required rows
    if isinstance(key, str): 
        logger.info('Reading key file' + key)
        key_path = os.path.join(dir, key)
        key_table = pd.read_csv(key_path, sep = ";", encoding = "utf-8")
    else:
        key_table = key
    
    # extract filenames from key table
    if key_file_row == "auto":
        key_file_row = len(key_table) - 1
    
    csvFile = key_table['datentabelle'][key_file_row]
    metaDataFile = key_table['metadatentabelle'][key_file_row]
    folderName = key_table['ordner'][key_file_row]
    folderPath = os.path.join(dir, folderName)
    csvPath = os.path.join(folderPath, csvFile)
    temporaryCSV = os.path.join(folderPath, 'temporary_csv.csv')
    filteredMetaData = os.path.join(folderPath, 'filtered_metaData.csv')

    logger.info('Using csv file: ' + csvFile)
    importIndicators(csvPath, temporaryCSV)
            
    logger.info('Using metadata file: ' + metaDataFile)
    importMetaData(folderPath, metaDataFile, filteredMetaData)

    logger.info('Clean up')
    os.remove(temporaryCSV)
    os.remove(filteredMetaData)

    logger.info('Finished')


def importIndicators(csv: str, temporaryCSV: str):
    logger.info('Importing of indicator data')

    columns_to_include = __parse_xml_config(config_path, "indicator", "sql")
    csv_headers = __parse_xml_config(config_path, "indicator", "csv")

    conn = __connect()
    cur = conn.cursor()
    

    # create table
    columns_definitions = ', '.join([f'{name} {type_}' for name, type_ in columns_to_include])
    create_table_sql = f'CREATE TABLE dashboard_data_de ({columns_definitions});'
    cur.execute(f"""
        DROP TABLE IF EXISTS dashboard_data_de;
        {create_table_sql}
    """)

    # read csv in chunks
    chunks = pandas.read_csv(csv, on_bad_lines='skip', sep=";", decimal= ",", chunksize=100000)

    header = True
    for chunk in chunks:
        # filter out every column beside the specified ones (from the config.xml)
        temporary_df = chunk[csv_headers]

        # filter the rows by Raumbezug 
        # (this may be eliminated in the future if the shapes for other spatial objects are available)
        df_gemeinden = temporary_df.loc[temporary_df['Raumbezug'] == 'Gemeinden']

        if len(df_gemeinden) == 0:
            continue
       
        # force Kennziffer to be numeric
        df_gemeinden = df_gemeinden.assign(Kennziffer = convert_or_na(df_gemeinden['Kennziffer']))

        # save chunk of data frame to .csv
        df_gemeinden.to_csv(temporaryCSV, index = False, encoding='utf-8', mode='w', quotechar='"', header=False)
        header = False
        # read in chunk from temporary csv
        with open(temporaryCSV, encoding='utf-8') as csv_reader:
            cur.copy_expert('COPY dashboard_data_de FROM STDIN WITH HEADER CSV', csv_reader)


    logger.info("Data insertion into database finished. Database operations follow.")

    # set id column to primary key and transform column 'wert'
    cur.execute("""
        ALTER TABLE dashboard_data_de DROP COLUMN id;
        ALTER TABLE dashboard_data_de ADD COLUMN id serial primary key;
        UPDATE dashboard_data_de SET wert = replace(wert,',','.')::numeric ;
        UPDATE dashboard_data_de SET wert = cast(wert as double precision);
    """)

    # convert varchars to text and drop redundant columns
    cur.execute("""
        ALTER TABLE dashboard_data_de ALTER COLUMN indikator TYPE text;
        ALTER TABLE dashboard_data_de ALTER COLUMN kennziffer TYPE text;
        ALTER TABLE dashboard_data_de ALTER COLUMN wert TYPE numeric USING wert::numeric;
        ALTER TABLE dashboard_data_de DROP COLUMN raumbezug;
        ALTER TABLE dashboard_data_de DROP COLUMN bereich;
        ALTER TABLE dashboard_data_de DROP COLUMN name;       
    """)

    # commit transaction
    conn.commit()
    
    # close connection
    cur.close()
    conn.close()


def importMetaData(dir: str, xlsxFileName: str, filteredMetaData: str):
    xlsxFileName = os.path.join(dir, xlsxFileName)
    
    logger.info('Preprocessing of meta data')
    preprocessMetaData(xlsxFileName, filteredMetaData)
    logger.info('Inserting of meta data')
    insertMetaData(filteredMetaData)

def preprocessMetaData(xlsx: str, filteredMetaData: str):
    metadata = pandas.read_excel(xlsx, sheet_name='ZOM')

    # eliminate indicies number 1 and 2
    newdf = metadata.drop(metadata.index[[1, 2]])

    # set first row as the new columns
    newdf.columns = newdf.iloc[0]
    newdf = newdf[1:]

    # filter out every column beside the specified ones
    csv_headers = __parse_xml_config("config.xml", "metadata", "csv")
    filtered_df = newdf[csv_headers]
    
    # eliminate null id rows
    filtered_df = filtered_df[filtered_df['MERK_ID'].notna()]

    # save datset to new csv file
    filtered_df.to_csv(filteredMetaData, index = False, encoding='utf-8') 

def insertMetaData(filteredMetaData: str):
    columns_to_include = __parse_xml_config("config.xml", "metadata", "sql")

    conn = __connect()
    cur = conn.cursor()

    # create table for meta data
    columns_definitions = ', '.join([f'{name} {type_}' for name, type_ in columns_to_include])
    create_table_sql = f'CREATE TABLE dashboard_data_metadata ({columns_definitions});'
    cur.execute(f"""
        DROP TABLE IF EXISTS dashboard_data_metadata;
        {create_table_sql}
    """)

    with open(filteredMetaData, encoding='utf-8') as csv_reader:
        cur.copy_expert('COPY dashboard_data_metadata FROM STDIN WITH HEADER CSV', csv_reader)

    # commit transaction
    conn.commit()
    
    # close connection
    cur.close()
    conn.close()

def __connect():
    
    return psycopg2.connect(
    host=dbConfig['host'],
    port=dbConfig['port'], 
    dbname=dbConfig['dbname'], 
    user=dbConfig['user'], 
    password=dbConfig['password'])



def __parse_xml_config(xml_file_path: str, section_name: str, type: str):
    tree = ET.parse(xml_file_path)
    root = tree.getroot()

    sections = root.findall(f'.//{section_name}')
    all_columns = []
    if type == "csv":
        for section in sections:
            columns_to_include = [mapping.find('csv').text for mapping in section.findall('.//mapping')]
            all_columns.extend(columns_to_include)
    elif type == "sql":
        for section in sections:
            columns_to_include = [(mapping.find('sql/name').text, mapping.find('sql/type').text) for mapping in section.findall('.//mapping')]
            all_columns.extend(columns_to_include)
    return all_columns


def convert_or_na(string):
    ''' Helper function for data wrangling
    (I can't believe I didn't find a more elegant inbuilt way)'''
    try:
        return pandas.to_numeric(string)
    except:
        return pandas.NA


if __name__ == '__main__':
    print("executing ImportInkar()")

    importInkar(dir = archive_dir)
    