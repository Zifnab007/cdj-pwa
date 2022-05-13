import { tempsDataBaseEnFR, elementFormatage } from "./outils.js";

// Classe "FormateurPetitTiroir" pour formater l'affichage d'un petit tiroir
export class FormateurPetitTiroir {
	constructor (avecPhoto) {
		this.structure = "";
		this.photo = avecPhoto;
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
