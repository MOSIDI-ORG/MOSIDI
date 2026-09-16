# import packages
import os
import numpy as np
import pandas as pd
import datetime
import logging
import json

#from instance import InkarProcess

logger = logging.getLogger("INKAR Importer")

# global variables determining whether a report be exported in the following formats
export_as_txt = True
export_as_json = True
export_as_csv = True

#### Class InkarAnalysisReport

class InkarAnalysisReport:
    def __init__(self, key_file_name = "key.csv", archive_location = ""):
        self.compare_two = None
        self.test_one = None
        self.archive_location = archive_location
        self.key_file_name = key_file_name
        self.files_found = None 
        self.year1 = 0
        self.year2 = 0
        self.dataset1_essential_columns = None
        self.dataset2_essential_columns = None
        self.same_columns = None
        self.columns1not2 = []
        self.columns2not1 = []
        self.nrows1 = 0
        self.nrows2 = 0
        self.set2bigger = None
        self.same_indicators = None
        self.indicators1not2 = []
        self.indicators2not1 = []
        self.same_kennziffern = None
        self.kennziffern1not2 = []
        self.kennziffern2not1 = []
        self.import_possible = False
    
    def export_as_txt(self, name = "Inkar_Comparison_Output"):
        # This function writes all the data contained in the report object into a txt file.
        # The text file aims to be nicely human-readable, and follows the logic that the reports had
        # when the output was produced in the function "compare_inkar_datasets"
        filename = name + str(datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")) + ".txt"
        output_file = open(filename, "w", encoding="utf-8")
        
        if self.compare_two == False:
            output_file.write("Der Vergleich von INKAR-Datensätzen war nicht erfolgreich, da weniger als zwei Datensätze in der Schlüsseldatei " + self.key_file_name + " enthalten sind.\n")
            if self.test_one:
                output_file.write("Es wird das Datenset aus dem Jahr " + str(self.year1) + " auf Tauglichkeit überprüft.\n")
                if self.dataset1_essential_columns:
                    output_file.write("Die Datentabelle enthält alle erforderlichen Spalten.")
                    output_file.close()
                    return
                else:
                    output_file.write("Die Datentabelle enthält nicht die erforderlichen Spalten!\n")
                    output_file.close()
                    return
                #end of routine for single data set
        else:
            output_file.write("Vergleich der INKAR-Datensätze aus den Jahren " + str(self.year1) + " und " + str(self.year2) + ".\n")
            output_file.write("Automatisch erstellt aus den Dateien im Archivordner (" + self.archive_location + ")\nam " + str(datetime.datetime.now()) + " Uhr.\n")
            output_file.write("---------------------\n")

            if self.files_found == False:
                output_file.write("Die Dateinamen und -orte konnten aus der 'key'-Tabelle nicht eindeutig identifiziert werden.")
                output_file.write("Deshalb konnte keine Analyse stattfinden.")
            else:
                output_file.write("\n---------------\nTabellenspalten\n---------------\n")

                if not self.dataset1_essential_columns:
                    output_file.write("Die Tabelle für " + str(self.year1) + " enthält nicht die erforderlichen Spalten!\n")                
                if not self.dataset2_essential_columns:
                    output_file.write("Die Tabelle für " + str(self.year2) + " enthält nicht die erforderlichen Spalten!\n")
                if not self.dataset1_essential_columns and self.dataset2_essential_columns:
                    output_file.close()
                    return
                if self.same_columns:
                    output_file.write("Beide Datentabellen enthalten die gleichen Spalten.\n")
                else:
                    output_file.write("Beide Datentabellen enthalten die erforderlichen Spalten, aber folgende Spalten unterscheiden sich:\n")
                    if len(self.columns2not1) > 0:
                        output_file.write("Die Tabelle von " + str(self.year2) + " enthält diese Spalten, die die Tabelle von " + str(self.year1) + " nicht enthält:\n")
                        output_file.write("; ".join(self.columns2not1) + "\n")
                    if len(self.columns1not2) > 0:
                        output_file.write("Die Tabelle von " + str(self.year1) + " enthält diese Spalten, die die Tabelle von " + str(self.year2) + " nicht enthält:\n")
                        output_file.write("; ".join(self.columns1not2) + "\n")
                    
                output_file.write("\n--------------------\nGröße der Datensätze\n--------------------\n")
                output_file.write("Der Datensatz für das Jahr " + str(self.year1) + " hat insgesamt " + str(self.nrows1) + " Zeilen.\n")
                output_file.write("Der Datensatz für das Jahr " + str(self.year2) + " hat insgesamt " + str(self.nrows2) + " Zeilen.\n")

                output_file.write("\n-----------\nIndikatoren\n-----------\n")
                if self.same_indicators:
                    output_file.write("Beide Datensätze enthalten Informationen zu den gleichen Indikatoren.\n")
                else:
                    output_file.write("Die Datensätze enthalten Informationen zu unterschiedlichen Indikatoren.\n")
                    if len(self.indicators1not2) > 0:
                        output_file.write("Folgende Indikatoren sind in dem Datensatz von " + str(self.year1) + " enthalten, aber nicht in dem Datensatz von " + str(self.year2) + ":\n")
                        output_file.write("; ".join(self.indicators1not2) + "\n")
                    if len(self.indicators2not1) > 0:
                        output_file.write("Folgende Indikatoren sind in dem Datensatz von " + str(self.year2) + " enthalten, aber nicht in dem Datensatz von " + str(self.year1) + ":\n")
                        output_file.write("; ".join(self.indicators2not1) + "\n")
                
                output_file.write("\n-------------------\nGemeindekennziffern\n-------------------\n")
                if self.same_kennziffern:
                        output_file.write("Beide Datensätze enthalten die gleichen Gemeindekennziffern in der Projektregion.\n")
                else:
                    output_file.write("Die Datensätze enthalten unterschiedliche Gemeindekennziffern (d.h. vermutlich unterschiedliche Gemeinden) in der Projektregion.\n")
                    if len(self.kennziffern1not2) > 0:
                        output_file.write("Folgende Gemeindekennziffern sind in dem Datensatz von " + str(self.year1) + " enthalten, aber nicht in dem Datensatz von " + str(self.year2) + ":\n")
                        output_file.write(str([int(x) for x in self.kennziffern1not2]) + "\n")
                    if len(self.kennziffern2not1) > 0:
                        output_file.write("Folgende Gemeindekennziffern sind in dem Datensatz von " + str(self.year2) + " enthalten, aber nicht in dem Datensatz von " + str(self.year1) + ":\n")
                        output_file.write(str([int(x) for x in self.kennziffern2not1]) + "\n")
    
        output_file.close()
    # end of function "export_as_txt"
    
    def export_as_json(self, name = "Inkar_Comparison_Output"):
        # writes all the data contained in the report object into a json file
        filename = name + str(datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")) + ".json"
        dictionary = vars(self)
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(dictionary, f, ensure_ascii=False, indent=4)
    # end of function "export as json"

    def export_as_csv(self, name = "Inkar_Comparison_Output"):
        # writes all the data contained in the report object into a csv file
        filename = name + str(datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")) + ".csv"
        output_file = open(filename, "w", encoding="utf-8")
        dictionary = vars(self)
        column_names = ";".join(list(dictionary.keys()))
        columns_values = ";".join([str(a) for a in list(dictionary.values())])
        output_file.write(column_names)
        output_file.write("\n")
        output_file.write(columns_values)



    def export(self, txt = True, json = True, csv = True, name = "Inkar_Comparison_Output" ):
        # wrapper function to call all three different export formats
        if txt:
            self.export_as_txt(name = name)
        if json:
            self.export_as_json(name = name)
        if csv:
            self.export_as_csv(name = name)

# end of class definition "InkarAnalysisReport"

    

##################
# helper functions
def InProjectRegionOnly(kennziffern_array, landkreiskennziffern = [12051, 12054, 12060, 12063, 12065, 12068, 12069, 12070, 12072, 12073]):
    # This function takes an array containing Gemeindekennziffern as strings, and returns an array that is a subset of the former,
    # where only those Kennziffern in the Project region are contained.
    
    # filter out elements with 8-figured Kennziffer
    gemeinden = kennziffern_array[np.char.str_len(kennziffern_array) == 8]
    # convert landkreiskennziffern to string
    landkreiskennziffern_str = [str(a) for a in landkreiskennziffern]
    # return filtered array
    return gemeinden[np.isin(gemeinden.astype('U5'), landkreiskennziffern_str)]


def testSingleDataset(file_key, report):
    # This function will be executed if there are not two datadsets in the key file.
    # It will test if the data set contains all required columns
    report.year1 = str(file_key['jahr'][0])
    report.test_one = True
    
     # Take filenames from key file
    datafilefolder = file_key['ordner'][0]
    datafilename = os.path.join(report.archive_location, datafilefolder, file_key['datentabelle'][0])
    report.file_found = True
    # read header
    header = pd.read_csv(datafilename, on_bad_lines='skip', sep=";", nrows = 100)
    # check if required columns are contained
    essential_columns = ['Indikator', 'Kennziffer', 'Name', 'Zeitbezug', 'Wert'] 
    if set(essential_columns) <= set(header.columns):
        report.dataset1_essential_columns = True
        report.import_possible = True
        return True
    else:
        report.dataset1_essential_columns = False
        logger.info("Error reading csv data table: Required columns do not exist in data table!\n")
        return False



# #####################
# The central function
def comparison(my): # my:InkarProcess):

    report = InkarAnalysisReport( key_file_name=my.key_path, archive_location=my.archive_dir)

    # If the key file is too short, the function ends here
    if len(my.key_table) < 2:
        report.compare_two = False
        if len(my.key_table) == 1:
            dataset_ok = testSingleDataset(my.key_table, report)
            report.export(export_as_txt, export_as_json, export_as_csv)
            my.correctformat = dataset_ok
            return
        else:
            report.export(export_as_txt, export_as_json, export_as_csv)
            my.correctformat = False
            return
    else:
        report.compare_two = True

    # to adjust for the old script:
    file_key = my.key_table

    # If the years were not explicitly given, they are taken as the last two rows from the key file
    year1 = file_key['jahr'][len(file_key)-2]
    year2 = file_key['jahr'][len(file_key)-1]
    report.year1 = str(year1)
    report.year2 = str(year2)
    
    # Take filenames from key file
    datafilenames1 = file_key['datentabelle'][file_key['jahr'] == year1]
    datafilenames2 = file_key['datentabelle'][file_key['jahr'] == year2]

    datafilefolders1 = file_key['ordner'][file_key['jahr'] == year1]
    datafilefolders2 = file_key['ordner'][file_key['jahr'] == year2]

    # check if unique data file names were found in the key table
    if len(datafilenames1) < 1 or len(datafilenames2) < 1 or len(datafilefolders1) < 1 or len(datafilefolders2) < 1:
        report.files_found = False
        logger.info("Error in reading key table: The specified year has no unique file names or folder names in the key table!")
        report.export(export_as_txt, export_as_json, export_as_csv)
        my.correctformat = False
        return
    else:
        datafilefolder1 = datafilefolders1[datafilefolders1.index[0]]
        datafilefolder2 = datafilefolders2[datafilefolders2.index[0]]
        datafilename1 = os.path.join(my.archive_dir, datafilefolder1, datafilenames1[datafilenames1.index[0]])
        datafilename2 = os.path.join(my.archive_dir, datafilefolder2, datafilenames2[datafilenames2.index[0]])
        report.files_found = True

    ### Analysis part 1: Are the correct columns contained in the tables? ###
    # (Analysis will not proceed if essential columns are missing)

    # read in first few rows from both data sets
    header1 = pd.read_csv(datafilename1, on_bad_lines='skip', sep=";", nrows = 100)
    header2 = pd.read_csv(datafilename2, on_bad_lines='skip', sep=";", nrows = 100)
    # define which columns are strictly necessary to proceed
    essential_columns = ['Indikator', 'Kennziffer', 'Name', 'Zeitbezug', 'Wert'] 

    # does each data set contain the essential columns?
    report.dataset1_essential_columns = set(essential_columns) <= set(header1.columns)
    report.dataset2_essential_columns = set(essential_columns) <= set(header2.columns)

    if not report.dataset1_essential_columns and report.dataset2_essential_columns:
        report.export(export_as_txt, export_as_json, export_as_csv)
        my.correctformat = False
        return
    else:
        report.same_columns = set(header1.columns) == set(header2.columns)
        report.columns1not2 = np.setdiff1d(header1.columns, header2.columns).tolist()
        report.columns2not1 = np.setdiff1d(header2.columns, header1.columns).tolist()


    ### Technical step: read through the data set and extract information from it (This is also the most time consuming part) ###

    # First for year1
    chunks = pd.read_csv(datafilename1, on_bad_lines='skip', sep=";", chunksize=100000, dtype={'Kennziffer': "str"}, iterator = True)
    # arrays / variables for writing information
    allkennziffern1 = np.empty(0, dtype = "str")
    allindicators1  = []
    report.nrows1 = 0
    # loop over the chunks
    for chunk in chunks:
        report.nrows1 += len(chunk)
        
        # extract unique Kennziffer and add to array
        kennziffern = [str(x) for x in chunk['Kennziffer'].unique()]
        allkennziffern1 = np.union1d(allkennziffern1, kennziffern)
        
        indicators = chunk['Indikator'].unique()
        allindicators1 = np.union1d(allindicators1, indicators)

    # Now the same for year2
    chunks = pd.read_csv(datafilename2, on_bad_lines='skip', sep=";", chunksize=100000, dtype={'Kennziffer': "str"}, iterator = True)
    # arrays / variables for writing information
    allkennziffern2 = []
    allindicators2 = []
    report.nrows2 = 0
    # loop over the chunks
    for chunk in chunks:
        report.nrows2 += len(chunk)
        
        # extract unique Kennziffer and add to array
        kennziffern = [str(x) for x in chunk['Kennziffer'].unique()]
        allkennziffern2 = np.union1d(allkennziffern2, kennziffern)
        
        indicators = chunk['Indikator'].unique()
        allindicators2 = np.union1d(allindicators2, indicators)
    report.set2bigger = (report.nrows2 > report.nrows1)

    ### Analysis part 3: Indicators ###
    # check / compare data sets
    report.same_indicators = np.array_equal(allindicators1, allindicators2)
    report.indicators1not2 = np.setdiff1d(allindicators1, allindicators2).tolist()
    report.indicators2not1 = np.setdiff1d(allindicators2, allindicators1).tolist()

    ### Analysis part 4: Gemeindekennziffern (national codes for municipalities) ### 
    # Limit to inside project region
    region_kennziffern1 = InProjectRegionOnly(allkennziffern1)
    region_kennziffern2 = InProjectRegionOnly(allkennziffern2)

    report.same_kennziffern = np.array_equal(region_kennziffern1, region_kennziffern2)
    # Set differences between the two data sets for the Gemendekennziffern in the project region 
    report.kennziffern1not2 = np.setdiff1d(region_kennziffern1, region_kennziffern2).tolist()
    report.kennziffern2not1 = np.setdiff1d(region_kennziffern2, region_kennziffern1).tolist()

    report.import_possible = True
    
    report.export(export_as_txt, export_as_json, export_as_csv)
    my.correctformat = True
    return
###  End of function definition "comparison"
    