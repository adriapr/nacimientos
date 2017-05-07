import pandas as pd
from unidecode import unidecode
import csv

def processName (name, corrections):

    row = corrections.loc[corrections['Nombre'] == name.capitalize()]

    if row['Borrar?'].any():
        return ''

    if row['Normalizado'].any():
        return row['Normalizado'].str.capitalize().tolist()[0]

    if row['Corregido'].any():
        return row['Corregido'].str.capitalize().tolist()[0]

    return name.capitalize()

def processSpreadSheet( spread, fields, saveFile ):

    for field in fields:

        print('Correcting field: %s' % field)

        for index, row in spread.iterrows():
            
            try:
                nameList = row[field].split()
            except:
                nameList = [] # to avoid error with empty values, as these are considered float and throw an error at .split()

            for i, nombre in enumerate(nameList):
                nameList[i] = processName( unidecode(nombre), corrections ) # we remove accents and strange characters with unicode()

            newName = ' '.join(nameList)
            newName = ' '.join(newName.split()) # remove extra spaces
            if newName == ' ': # remove single space when everything else is deleted
                newName = ''

            spread.loc[index,field] = newName

    print('Saving spreadsheet as: %s' % saveFile)
    spread.to_csv(saveFile, sep=',', index=False, quoting=csv.QUOTE_NONNUMERIC)

    print(spread.head(2))

file_corrections    = '/media/adria/HDD/visdata/nacimientos/data/noms_correccions.csv'
corrections         = pd.read_csv(file_corrections)

file_bautismos      = '/media/adria/HDD/visdata/nacimientos/data/allNacimientos_preCorrected.csv'
file_bautismos_new  = '/media/adria/HDD/visdata/nacimientos/data/allNacimientos.csv'
bautismos           = pd.read_csv(file_bautismos)

processSpreadSheet( bautismos, ['NOMBRE', 'NOMPADRE', 'NOMMADRE', 'NPADRINO', 'NMADRINA'], file_bautismos_new )
# processSpreadSheet( defunciones, ['NOMBRE', 'NOMPADRE', 'NOMMADRE'], file_defunciones_new )
