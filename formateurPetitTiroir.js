import { dateHeureFormatage, elementFormatage } from "./outils.js";

// Classe "FormateurPetitTiroir" pour formater l'affichage d'un petit tiroir
export class FormateurPetitTiroir {
	constructor () {
		this.structure = "";
	}

	elementEnHTML(key, value){
		let elementStr = "";
		if (null != value) { 
			elementStr = `<b>${key}</b> : ${value}<br/>
`;
		}
		 return elementStr;
	}

	commencer($structure) {
		this.structure = $structure;
		return `
`;
		}

	ajouter(element) {
		let html = `
      <div class="message is-info">
        <div class="message-header">
          <p>${element.nom}</p>
          <label class="input is-hidden">${element.id}</label>
	  <div class="field is-grouped">
            <p class="control">
	      <buttom class="button is-warning" id="M${element.id}">Mod.</buttom>
            </p>
            <p class="control">
	      <button class="button is-danger" id="S${element.id}">Sup.</buttom>
            </p>
          </div>
        </div>
        <div class="message-body">
`;
		let index = 0;
		for (const [key, value] of Object.entries(element.record)) {
			let texte = elementFormatage(value, this.structure[index].type);
			html += this.elementEnHTML(key, texte); 
			index++;
		}

		html += `
          <br/>
          <strong>Création</strong> le <time datetime="${
                    element.created_at
                  }">${dateHeureFormatage.format(new Date(element.created_at))}</time><br/>
          <strong>Mise à jour</strong> le <time datetime="${
                    element.updated_at
                  }">${dateHeureFormatage.format(new Date(element.updated_at))}</time><br/>
        </div>
      </div>
`;
		return html;
	}

	finir() {
		return `
`;
	}
}
