// Classe "FormateurGrandTiroir" pour formater l'affichage d'un petit tiroir
import { tracer, tracerTable } from "./traceur.js";
import { tempsDataBaseEnFR, elementFormatage, commerceListeFormatage } from "./outils.js";


export class FormateurGrandTiroir {
	constructor (avecPhoto, avecCommerce) {
		this.structure = "";
		this.photo = ("1" == avecPhoto);
		this.commerce = ("1" == avecCommerce);
	}

	elementEnHTML(key, value){
		let elementStr = "";
		if (null != value) { 
			elementStr = `<b>${key}</b> : ${value}<br/>
`;
		}
		 return elementStr;
	}

	commencer(structure) {
		this.structure = structure;
		tracerTable(structure);
		let html = `
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>
            </th>`;
		if (this.photo) {
			html += `
            <th>
              <abbr title="Icone">Icone</abbr>
            </th>`;
		}
		html += `
            <th>
              <abbr title="Nom">Nom</abbr>
            </th>`;
		structure.forEach(function (champs, index) {
			html += `
            <th>
              <abbr title="${champs.nom}">${champs.nom}</abbr>
            </th>`;
		});
		if (this.commerce) {
			html += `
	    <th>
              <abbr title="Prix">Prix</abbr>
            </th>`;
		}
		html += `
	    <th>
              <abbr title="Modification">Modifié le</abbr>
            </th>
	    <th>
              <abbr title="Creation">Créé le</abbr>
            </th>
            <th>
            </th>
          </tr>
        </thead>
        <tfoot>
          <tr>
            <th>
            </th>`;
		if (this.photo) {
			html += `
            <th>
              <abbr title="Icone">Icone</abbr>
            </th>`;
		}
		html += `
	    <th>
              <abbr title="Nom">Nom</abbr>
            </th>`;
		structure.forEach(function (champs, index) {
			html += `
            <th>
              <abbr title="${champs.nom}">${champs.nom}</abbr>
            </th>`;
		});
		if (this.commerce) {
			html += `
	    <th>
              <abbr title="Prix">Prix</abbr>
            </th>`;
		}
		html += `
	    <th>
              <abbr title="Modification">Modifié le</abbr>
            </th>
	    <th>
              <abbr title="Creation">Créé le</abbr>
            </th>
            <th>
            </th>
          </tr>
        </tfoot>
        <tbody>`;
		return html;
		}

	ajouter(element) {

		let html = `
          <tr>
            <td>
              <p class="control"> <buttom class="button is-link" id="M${element.id}">Mod.</buttom> </p>
            </td>`;
		if (this.photo) {
			html += `
            <td>`;
			if ("" != element.icone) {
				html += `
	      <figure class="image is-64x64">
                <img src="${element.icone}">
              </figure>`;
			}
			html += `
            </td>`;
		}
		html += `
            <td>${element.nom}</td>`;
		let index = 0;
		for (const [key, value] of Object.entries(element.record)) {
			let texte = elementFormatage(value, this.structure[index].type);
			html += `
            <td>${texte}</td>`;
			index++;
		};
		if (this.commerce) {
			tracer("Avec commerces");
			let lesPrix = "";
			for (const [key, value] of Object.entries(element.Commerces)) {
				lesPrix = commerceListeFormatage(value);
				tracer("commerces id:"+value.id);
			}
			html += `
	        <td><!-- Prix -->`;
			if ("" != lesPrix) {
			html += `
                  <p class="control"><button class="button is-link" id="P${element.id}">Prix</buttom> </p>`;
			html += `
                </td>`;
			}
		}
		html += `
	        <td>${tempsDataBaseEnFR(element.created_at)}</td>
	        <td>${tempsDataBaseEnFR(element.updated_at)}</td>
	    <td><p class="control"> <button class="button is-link" id="S${element.id}">Sup.</buttom> </p></td>
          </tr>`;

		return html;
	}

	finir() {
		return `
        </tbody>
      </table>
    </div>`;
	}
}
