import pymagicc
from pymagicc import scenarios
import copy


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

    for i in range(2019, 2101):
        data.at[i, "FossilCO2"] = float(fossil_gtc_carbon)

    results = pymagicc.run(data)
    results_df = results['SURFACE_TEMP']['GLOBAL']
    ret_json = {}
    ret_json['start_year'] = str(results_df.index[0])
    ret_json['global_temps'] = list(results_df.values)
    results_df = results['SURFACE_TEMP']['NH-LAND']
    ret_json['NH_temps'] = list(results_df.values)
    return ret_json
