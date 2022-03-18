import json
from collections import defaultdict

ape_api_data = json.load(open('./ape-api.json'))

total_apes = 2974

attribute_master_list =  defaultdict(lambda: defaultdict(int))
attribute_percentage_list = defaultdict(lambda: defaultdict(int))


for i, ape in ape_api_data.items():
    for attribute in ape['attributes']:
        if type(attribute['value']) is list: 
            for value in attribute['value']:
                attribute_master_list[attribute['trait_type']][value] += 1
        else:
            attribute_master_list[attribute['trait_type']][attribute['value']] += 1
    
for attribute_type, attribute_values in attribute_master_list.items():
    for attribute_value, ape_count in attribute_values.items():
        attribute_percentage_list[attribute_type][attribute_value] = ape_count / total_apes


def ape_scorer(attributes):
    """
    calculates the rarity score based on this medium article
    https://raritytools.medium.com/ranking-rarity-understanding-rarity-calculation-methods-86ceaeb9b98c
    """
    score = 0
    for attribute in attributes:
        if type(attribute['value']) is list:
            for value in attribute['value']:
                if value != 'None':
                    score += attribute_percentage_list[attribute['trait_type']][value]
                score += attribute_percentage_list[attribute['trait_type']][value]
        else:
            if attribute['value'] != 'None':
                score += 1 / (attribute_master_list[attribute['trait_type']][attribute['value']] / total_apes)
    return score


for i, ape in ape_api_data.items():
    ape['rarity_score'] = ape_scorer(ape['attributes'])

ape_ranks = [(i, ape['rarity_score']) for i, ape in ape_api_data.items()]
ape_ranks.sort(key=lambda x: x[1], reverse=True)

rank_string = ""

for i, ape in enumerate(ape_ranks):
    rank_string += f"Rank #{i+1} Ape:{ape[0]} Score:{ape[1]}\n"
    ape_api_data[ape[0]]['rarity_rank'] = i + 1


open('./rank.txt','w').write(rank_string)

json.dump(ape_api_data, open('./ape-api.json', 'w'), indent=4)
json.dump(attribute_percentage_list, open('./attribute-percentage-list.json', 'w'), indent=4)
json.dump(attribute_master_list, open('./attribute-number-list.json', 'w'), indent=4)

