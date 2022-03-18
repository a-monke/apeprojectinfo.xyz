import { ethers } from "ethers";
import ape_abi from "../abi/ape-abi.json";
import ape_api from "../data/ape-api.json";
import attribute_number_list from "../data/attribute-number-list.json";
import attribute_percentage_list from "../data/attribute-percentage-list.json";
import { ChainId, Token, WETH, Fetcher, Route } from "@uniswap/sdk";

const MAX_APES = 2974;

let provider = ethers.getDefaultProvider();

const ape_contract = new ethers.Contract(
  "0x74868b8828A05d2C4945917399697B1006125f22",
  ape_abi,
  provider
);

const VARIABLE = new Token(
  ChainId.MAINNET,
  "0x3F33D5b179680b18aC60b2a4cEFAA6F4FB355891",
  18
);

const DAI = new Token(
  ChainId.MAINNET,
  "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  18
);

class APE {
  constructor(id) {
    // convert token id to hex and save
    this.genesis = id < 777;
    this.id_num = id;
    this.id = ethers.utils.hexlify(id);

    // update site with new token
    this.update();
  }

  async update() {
    loading();
    await this.set_image();
    await this.set_rarity();
    await this.set_attributes();
    await this.get_owner();
    this.update_genesis();
    this.update_governance();
    await this.update_variable();

    close_loading();
  }

  async update_genesis() {
    let genesis = document.getElementById("ape-genesis");
    if (this.genesis) {
      genesis.innerHTML = "Yes";
    } else {
      genesis.innerHTML = "No";
    }
  }

  async update_governance() {
    let in_governance = await ape_contract.getGovernance(this.owner_address);
    let governance = document.getElementById("ape-governance");
    if (in_governance) {
      governance.innerHTML = "Yes";
    } else {
      governance.innerHTML = "No";
    }
  }

  async update_variable() {
    let owned = [this.id];
    let claim_amount = await ape_contract.getClaimAmount(
      this.owner_address,
      owned
    );
    let claim_amount_element = document.getElementById("ape-variable");
    claim_amount = ethers.utils.formatUnits(claim_amount, 18);
    claim_amount_element.innerHTML = claim_amount;
    // variable to weth 
    let pair = await Fetcher.fetchPairData(VARIABLE, WETH[VARIABLE.chainId]);
    let route = new Route([pair], WETH[VARIABLE.chainId]);
    let var_weth_price = route.midPrice.invert().toSignificant(6);
    let claim_amount_weth = claim_amount * var_weth_price;
    let claim_amount_weth_element =
      document.getElementById("ape-variable-weth");
    claim_amount_weth_element.innerHTML = claim_amount_weth;

    let var_weth_price_element = document.getElementById("variable-to-weth");
    var_weth_price_element.innerHTML = (1 * var_weth_price).toPrecision(3);
    
    // weth to usd
    pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId]);
    route = new Route([pair], WETH[DAI.chainId]);
    let weth_to_dai = route.midPrice.toSignificant(6)
      
    let claim_amount_usd = claim_amount_weth * weth_to_dai; // 201.3066
    let claim_amount_usd_element = document.getElementById("ape-variable-usd");
    claim_amount_usd_element.innerHTML = claim_amount_usd.toFixed(2);

    let var_usd_element = document.getElementById("variable-to-usd");
    var_usd_element.innerHTML = (weth_to_dai * var_weth_price).toPrecision(3);
  }

  async set_attributes() {
    let attributes = ape_api[this.id_num].attributes;
    let attribute_element = document.getElementById("ape-attributes");
    attribute_element.innerHTML = "";
    for (let i = 0; i < attributes.length; i++) {
      let attribute = attributes[i];
      let trait_type = attribute.trait_type;
      // check if type of attribute value is a list
      if (Array.isArray(attribute.value)) {
        for (let j = 0; j < attribute.value.length; j++) {
          let value = attribute.value[j];
          let attribute_percentage =
            attribute_percentage_list[trait_type][value];
          attribute_percentage = attribute_percentage * 100;
          attribute_percentage = attribute_percentage.toFixed(2);

          let attribute_string =
            "<div>" +
            trait_type +
            " : " +
            value +
            " : " +
            attribute_percentage +
            "%</div>";
          attribute_element.innerHTML += attribute_string;
        }
      } else {
        let value = attribute.value;
        let attribute_percentage = attribute_percentage_list[trait_type][value];
        attribute_percentage = attribute_percentage * 100;
        attribute_percentage = attribute_percentage.toFixed(2);

        let attribute_string =
          "<div>" +
          trait_type +
          " : " +
          value +
          " : " +
          attribute_percentage +
          "%</div>";
        attribute_element.innerHTML += attribute_string;
      }
    }
  }

  async get_owner() {
    this.owner_address = await ape_contract.ownerOf(this.id);
    let owner = document.getElementById("ape-owner");
    let ens_name = await provider.lookupAddress(this.owner_address);
    if (ens_name) {
      owner.innerHTML = ens_name;
    } else {
      owner.innerHTML = this.owner_address;
    }
  }

  async set_rarity() {
    let rarity_score = ape_api[this.id_num].rarity_score;
    let rarity_rank = ape_api[this.id_num].rarity_rank;
    let rarity_score_element = document.getElementById("ape-rarity-score");
    let rarity_rank_element = document.getElementById("ape-rarity-rank");
    rarity_score_element.innerHTML = rarity_score;
    rarity_rank_element.innerHTML = rarity_rank;
  }

  async set_image() {
    let ape_data = ape_api[this.id_num];
    // get image
    let image = document.getElementById("ape-image");
    image.src = ape_data.image;
  }
}

// setup ape to respond to input updates
window.addEventListener("DOMContentLoaded", (event) => {
  document.getElementById("ape-id-input").onchange = (event) => {
    let id = parseInt(event.target.value);
    // check if id is valid
    if (id > 0 && id <= MAX_APES) {
      ape = new APE(id);
    } else {
      alert("Invalid id, choosing a random valid ape");
      document.getElementById("ape-id-input").value = choose_random_ape();
      ape = new APE(choose_random_ape());
    }
  };

  let rand_id = choose_random_ape();
  document.getElementById("ape-id-input").value = rand_id;
  let ape = new APE(rand_id);

  window.setInterval(async () => await ape.update_variable(), 5000);
});

function choose_random_ape() {
  return Math.floor(Math.random() * (MAX_APES + 1));
}
