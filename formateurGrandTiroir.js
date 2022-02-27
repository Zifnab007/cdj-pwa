// Classe "FormateurGrandTiroir" pour formater l'affichage d'un petit tiroir
import { tracer, tracerTable } from "./traceur.js";
import { dateHeureFormatage, elementFormatage } from "./outils.js";


export class FormateurGrandTiroir {
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

	commencer(structure) {
		this.structure = structure;
		tracerTable(structure);
		let html = `
      <table class="table">
        <thead>
          <tr>
            <th>
            </th>
            <th>
              <abbr title="Nom">Nom</abbr>
            </th>`;
		structure.forEach(function (champs, index) {
			html += `
            <th>
              <abbr title="${champs.nom}">${champs.nom}</abbr>
            </th>`;
		});
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
            </th>
	    <th>
              <abbr title="Nom">Nom</abbr>
            </th>`;
		structure.forEach(function (champs, index) {
			html += `
            <th>
              <abbr title="${champs.nom}">${champs.nom}</abbr>
            </th>`;
		});
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
              <p class="control"> <buttom class="button is-warning" id="M${element.id}">Mod.</buttom> </p>
            </td>
            <td>${element.nom}</td>`;
		let index = 0;
		for (const [key, value] of Object.entries(element.record)) {
			let texte = elementFormatage(value, this.structure[index].type);
			html += `
            <td>${texte}</td>`;
			index++;
		};
		html += `
	    <td>${dateHeureFormatage.format(new Date(element.created_at))}</td>
	    <td>${dateHeureFormatage.format(new Date(element.updated_at))}</td>
	    <td><p class="control"> <button class="button is-danger" id="S${element.id}">Sup.</buttom> </p></td>
          </tr>`;

		return html;
	}

	finir() {
		return `
        </tbody>
      </table>`;
	}
}
