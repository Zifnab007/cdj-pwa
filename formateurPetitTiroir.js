import { tempsDataBaseEnFR, elementFormatage, commerceListeFormatage } from "./outils.js";
import { tracer } from "./traceur.js";

// Classe "FormateurPetitTiroir" pour formater l'affichage d'un petit tiroir
export class FormateurPetitTiroir {
	constructor (avecPhoto, avecCommerce) {
		this.structure = "";
		this.photo = avecPhoto;
		this.commerce = avecCommerce;
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
        <div class="message-header">`;
		if (this.photo && ("" != element.icone)) {
			html += `
          <figure class="image is-128x128">
            <img src="${element.icone}">
          </figure>`;
		}
		html += `
          <p>${element.nom}</p>
          <label class="input is-hidden">${element.id}</label>
          <div class="field is-grouped">
            <p class="control">
              <buttom class="button is-link" id="M${element.id}">Mod.</buttom>
            </p>
            <p class="control">
              <button class="button is-link" id="S${element.id}">Sup.</buttom>
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

		if (this.commerce) {
			tracer("Avec commerces");
			for (const [key, value] of Object.entries(element.Commerces)) {
				let texte = commerceListeFormatage(value);
				html += this.elementEnHTML('Commerce', texte); 
				tracer("commerces id:"+value.id);
			}
		}

		html += `
          <br/>
          <strong>Création</strong> le <time datetime="${
                    element.created_at
                  }">${tempsDataBaseEnFR(element.created_at)}</time>
          <strong>Mise à jour</strong> le <time datetime="${
                    element.updated_at
                  }">${tempsDataBaseEnFR(element.updated_at)}</time><br/>
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
