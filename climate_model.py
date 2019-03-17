import pymagicc
from pymagicc import scenarios
import copy


# Takes in Gigatons Carbon Dioxide per year and returns time series of temperature
def climate_model(fossil_gtc_carbon):
    data = scenarios['RCP26']['WORLD']
    copy_row = data.loc[[2007]]

    for index, row in data.iterrows():
        if index > 2007:
            data = data.drop(index)

    for i in range(2008, 2101):
        temp = copy.deepcopy(copy_row)
        for index, row in temp.iterrows():
            data.loc[i] = row.tolist()
            break
    
    # All future years have this amount of CO2
    for i in range(2019, 2101):
        data.at[i, "FossilCO2"] = float(fossil_gtc_carbon)

    # Funnel into model and parse results
    results = pymagicc.run(data)
    results_df = results['SURFACE_TEMP']['GLOBAL']
    ret_json = {}
    ret_json['start_year'] = str(results_df.index[0])
    ret_json['global_temps'] = list(results_df.values)
    results_df = results['SURFACE_TEMP']['NH-LAND']
    # Specific data used by the sea model
    ret_json['NH_temps'] = list(results_df.values)
    return ret_json
