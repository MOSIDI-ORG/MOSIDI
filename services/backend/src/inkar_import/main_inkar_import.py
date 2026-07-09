from process_class import InkarProcess

import logging
import os


# The URL where the zip files with the inkar data are located:
url = "https://www.bbr-server.de/imagemap/inkar/download/"
archive_directory = os.getenv('DEMOGRAPHIC_DATA_FILES_PATH', 'C:\\innowest\\data\\archive\\')

# Configure logging
logging.basicConfig(
    filename='./inkar_import.log', 
    level=logging.DEBUG, 
    format='%(asctime)s - %(levelname)s: %(message)s', 
    datefmt='%d.%m.%Y %H:%M:%S')
logger = logging.getLogger("INKAR Importer")

# Initialize an object of the process class
my = InkarProcess(url, archive_directory)

# Download new data if necessary
logger.info("Starting Downloader")
my.download()

# Compare new data with old data if applicable
if my.new_data_available:
    logger.info('Starting data comparison')
    my.comparison()
    logger.info('Data comparison finished. Data set fits known format: ' + str(my.correctformat))
else:
    logger.info('Process did nothing, since no new data was found.')
    print('Process did nothing, since no new data was found.')

if my.correctformat:
    logger.info('Starting import into database')
    my.db_import()
else:
    logger.info('Did not import data into database, since it did not fit the required format')
