import { chunkArray, dateTimeFormat } from "./utils.js";

export default function generateUI(json){

	console.info('appel de la fonction generateUI');

  const repos = json.map(j => ({
    name: j.name,
    icon: j.icon,
    description: j.description || "",
    updated_at: j.updated_at
  }));

  const chunks = chunkArray(repos, 3);

  let html = "";

  chunks.forEach(chunk => {
    html += '<div class="section"><div class="columns">';

    chunk.forEach(tiroir => {
      html += `
          <div class="column">
            <div class="card has-background-primary">
              <div class="card-content">
                <div class="media">
                  <div class="media-lefti">
                    <figure class="image is-48x48">
                      <img class="has-background-info is-rounded"
                        src="${tiroir.icon}"
                        alt="Placeholder image"
                      />
                    </figure>
                  </div>
                  <div class="media-content">
                    <p class="title is-4">${tiroir.name}</p>
                  </div>
                </div>
  
                <div class="content">
                   ${tiroir.description}
                  <br />
                  Dernière mise à jour: <time datetime="${
                    tiroir.updated_at
                  }">${dateTimeFormat.format(new Date(tiroir.updated_at))}</time>
                </div>
              </div>
            </div>
          </div>`;
    });
    html += "</div></div>";
  });

  document.querySelector(".container").innerHTML = html;
	console.log("DEBUG La page COMMODE est chargée");
}

document.addEventListener("DOMContentLoaded", function() {
	fetch("https://zifnab-pwa.go.yo.fr/data.php")
		.then(response => response.json(), err => console.error('DEBUG Une erreur lors du fetch data.php : ' + err))
		.then(json => generateUI(json) );
});
