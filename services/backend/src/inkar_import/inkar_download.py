import os
import requests
import patoolib
import glob
import logging
import datetime

#from instance import InkarProcess

logger = logging.getLogger("INKAR Importer")


def download(my): # : InkarProcess):
    
    # find the newest existing inkar version
    if my.zFileName == "latest":
        year = datetime.date.today().year + 1
        zFileName = "inkar_" + str(year) + ".zip"
        downloadURL = my.url + zFileName
        # check if URL exists; otherwise go one year back
        while requests.head(downloadURL).status_code != requests.codes.ok:
            year = year - 1
            zFileName = "inkar_" + str(year) + ".zip"
            downloadURL = my.url + zFileName
    else:
        downloadURL = my.url + zFileName
    # Note: if my.zFileName is not "latest", the entire function will fail, because the variable "year", which is only defined in the if-clause, is required below

    # check if the latest available year had already been downloaded successfully according to key table
    if (True in my.key_table.loc[my.key_table["jahr"]==year]['download_successful'].values):
        folder_name = my.key_table.loc[(my.key_table["jahr"]==year) & (my.key_table['download_successful']==True)]['ordner'].iloc[0]
        folder_exists = os.path.exists(os.path.join(my.archive_dir, folder_name))
        prior_download_can_be_used = folder_exists and (not my.force_download)
    else:
        prior_download_can_be_used = False

        
    if prior_download_can_be_used:
        my.new_data_available = False
        logger.info("Did not start new download, as existing download is available in the folder " + folder_name)
        #check for required files in folder
        [csvFile, metadFile, rglFile] = filenames_in_folder(os.path.join(my.archive_dir, folder_name))
        
    else:
        my.new_data_available = True
        logger.info("New data set was found. Starting Download.")
        response = requests.get(downloadURL)
        
        if response.status_code == requests.codes.ok:
            zFilePath = os.path.join(my.archive_dir, zFileName)
            with open(zFilePath, "wb") as f:
                f.write(response.content)

            # take the folder name from the name of the zip file
            folder_name = zFileName.split(".")[0]
            folder_path = os.path.join(my.archive_dir, folder_name)
        
            # if the folder already exists (and the new download is forced), "-i" is added to the end of the name, where i is a number
            folder_name1 = folder_name
            i = 1
            while os.path.exists(folder_path):
                folder_name = folder_name1 + "-" + str(i)
                folder_path = os.path.join(my.archive_dir, folder_name)
                i += 1
            # extract zip    
            logger.info("Extracting compressed files")
            patoolib.extract_archive(zFilePath, outdir=folder_path)
            #check for required files in folder
            [csvFile, metadFile, rglFile] = filenames_in_folder(os.path.join(my.archive_dir, folder_name))
        else:
            logger.info("Download was not successful")
    
    if my.new_data_available:
        # append row to key file
        new_row = [year, folder_name, csvFile, metadFile, rglFile, True, False]
        my.current_key_entry = len(my.key_table)
        my.key_table.loc[my.current_key_entry,:] = new_row
        # make sure year is formatted as int
        my.key_table.jahr = my.key_table.jahr.astype(int)
        # save key table into csv
        my.key_save()
        logger.info("New entry registered to key table.")

    logger.info("Downloader finished.")
    
    return



def filenames_in_folder(folder_path):
    ''' for extracting the names of individual files of the INKAR download'''
    # recognize different files from patterns in the file names
    csvNamePattern = os.path.join(folder_path, 'inkar*.csv')
    metaDataNamePattern = os.path.join(folder_path, '*ndikatoren*.xlsx')
    raumgliederungNamePattern = os.path.join(folder_path, '*eferenz*.xlsx')
    infostring = "looking for patterns: " + csvNamePattern + " and " + metaDataNamePattern + " and " + raumgliederungNamePattern
    logger.info(infostring)
    
    csvFiles: list[str] = glob.glob(csvNamePattern)
    metaDataFiles: list[str] = glob.glob(metaDataNamePattern)
    raumgliederungFiles: list[str] = glob.glob(raumgliederungNamePattern)

    if len(csvFiles) != 1 or len(metaDataFiles) != 1 or len(raumgliederungFiles) != 1:
        logger.info("Could not identify unique files of the expected pattern! Registering to key file failed!")
        return []
    else:
        csvFileName = csvFiles[0].split("\\")[-1]
        metaDataFileName = metaDataFiles[0].split("\\")[-1]
        raumgliederungsFileName = raumgliederungFiles[0].split("\\")[-1]
    
    return [csvFileName, metaDataFileName, raumgliederungsFileName]
    
