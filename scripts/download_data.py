#!/usr/bin/env python3
import requests
import os
from datetime import datetime

def download_owid_data():
    """Download Our World in Data COVID-19 dataset"""
    url = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv"
    
    print(f"Downloading OWID data from {url}...")
    response = requests.get(url)
    response.raise_for_status()

    os.makedirs('data/raw/owid', exist_ok=True)

    timestamp = datetime.now().strftime('%Y%m%d')
    filepath = f'data/raw/owid/owid-covid-data-{timestamp}.csv'
    
    with open(filepath, 'wb') as f:
        f.write(response.content)
    
    print(f"✓ Data saved to {filepath}")
    print(f"  File size: {len(response.content) / 1024 / 1024:.2f} MB")
    return filepath

def download_johns_hopkins_data():
    """Download Johns Hopkins COVID-19 datasets"""
    base_url = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series"
    
    datasets = {
        'confirmed': 'time_series_covid19_confirmed_global.csv',
        'deaths': 'time_series_covid19_deaths_global.csv',
        'recovered': 'time_series_covid19_recovered_global.csv'
    }
    
    os.makedirs('data/raw/johns-hopkins', exist_ok=True)
    downloaded_files = []
    
    for name, filename in datasets.items():
        url = f"{base_url}/{filename}"
        print(f"Downloading {name} data from Johns Hopkins...")
        
        response = requests.get(url)
        response.raise_for_status()
        
        filepath = f'data/raw/johns-hopkins/{filename}'
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"✓ {name.capitalize()} data saved to {filepath}")
        downloaded_files.append(filepath)
    
    return downloaded_files

if __name__ == '__main__':
    print("=" * 60)
    print("COVID-19 Data Download Script")
    print("=" * 60)
    
    try:
        owid_file = download_owid_data()
        jh_files = download_johns_hopkins_data()
        
        print("\n" + "=" * 60)
        print("✓ All downloads completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        exit(1)