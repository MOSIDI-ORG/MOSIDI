import inkar_db_import as iki
import inkar_download as ikd
import inkar_version_comparison as ikv

import pandas as pd
import os


class InkarProcess:
    def __init__(self, url, archive_dir, key_name = "key.csv", zFileName = "latest", force_download = False):
        self.url = url
        self.archive_dir = archive_dir
        self.key_name = key_name
        self.key_path = os.path.join(archive_dir, key_name)
        self.zFileName = zFileName
        self.force_download = force_download
        self.new_data_available = False
        self.download_successful = False
        self.comparison_successful = False
        self.correctformat = False
        self.key_table = pd.DataFrame()
        self.current_key_entry = 0
        # read key table if exists
        try: 
            self.key_table = pd.read_csv(self.key_path, sep = ";", encoding = "utf-8")
        except:
            self.key_table = pd.DataFrame(columns=["jahr","ordner","datentabelle","metadatentabelle",
                                                   "raumordnungstabelle","download_successful","import_successful"])



    def download(self):
        ikd.download(self)

    def comparison(self):
        ikv.comparison(self)
        
    def db_import(self):
        iki.db_import(self)

    def key_save(self):
        self.key_table.to_csv(self.key_path,
                              sep = ";",
                              encoding = "utf-8",
                              index = False)
    



