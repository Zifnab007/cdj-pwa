import { dateHeureFormatage } from "./outils.js";

// Classe "FormateurCommode" pour formater l'affichage de la commode
export class FormateurCommode {
	constructor () {
		this.nbElement = 0;
	}
	commencer() {
		return `
<div class="tile is-ancestor is-vertical">
  <div class="tile is-horizontal is-parent">
`;
	}

	ajouter(element) {
		let html = "";
		if (0 == this.nbElement) { html += this.commencer(); }

		if ((0 != this.nbElement) && (0 == (this.nbElement % 3))) {
			html += `
  </div> <!-- tile is-horizontal -->
  <div class="tile is-horizontal is-parent">
`; }
		html += `
    <div class="tile is-child block avecMarge">
      <div class="message is-info">
        <div class="message-header">
          <p>${element.nom}</p>
          <label class="input is-hidden">${element.id}</label>
	  <div class="button is-link" id="T${element.id}">Ouvrir</div>
        </div>
        <div class="message-body">
          <strong>Description</strong>: ${element.description}<br/>
          <strong>Création</strong> le <time datetime="${
                    element.created_at
                  }">${dateHeureFormatage.format(new Date(element.created_at))}</time><br/>
          <strong>Mise à jour</strong> le <time datetime="${
                    element.updated_at
                  }">${dateHeureFormatage.format(new Date(element.updated_at))}</time><br/>
        </div>
      </div>
    </div>
`;
		this.nbElement++;

		return html;
	}

	finir() {
		return `
  </div> <!-- tile is-horizontal -->
</div> <!-- tile is-ancestor -->
`;
	}
}
