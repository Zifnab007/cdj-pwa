function chunkArray(array, size) {
  if (array.length <= size) {
    return [array];
  }
  return [array.slice(0, size), ...chunkArray(array.slice(size), size)];
}

const dateTimeFormat = Intl.DateTimeFormat("fr");

function generateUI(json){
  const repos = json.map(j => ({
    name: j.name,
    icon: j.icon,
    description: j.description || "",
    updated_at: j.updated_at
  }));

  const chunks = chunkArray(repos, 3);

  let html = "";

  chunks.forEach(chunk => {
    html += '<div class="section has-background-primary-light"><div class="columns">';

    chunk.forEach(tiroir => {
      html += `
          <div class="column">
            <div class="card has-background-primary-light">
              <div class="card-content has-background-primary-light">
                <div class="media">
                  <div class="media-lefti has-background-warning-dark">
                    <figure class="image is-48x48">
                      <img
                        src="https://zifnab-pwa.go.yo.fr/${tiroir.icon}"
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
}
const json = [
  {
    id: 1,
    node_id: "MDEwfjBuglfJaXRvcnk2NjEwNDg2Mw==",
    name: "Tissu",
    icon: "images/icons/icon-96x96.png",
    html_url: "https://github.com/EmmanuelDemey/10K-Project",
    description: null,
    created_at: "2016-08-19T18:46:12Z",
    updated_at: "2016-10-09T12:08:54Z",
  },
  {
    id: 2,
    node_id: "MDEwOlJlcG9zaXRvcnk2NjEwNDg2Mw==",
    name: "Médaille",
    icon: "images/icons/icon-96x96.png",
    html_url: "https://github.com/EmmanuelDemey/10K-Project",
    description: "Médailles de la Monnaie de Paris",
    created_at: "2016-08-19T18:46:12Z",
    updated_at: "2016-10-09T12:08:54Z",
  }
];

document.addEventListener("DOMContentLoaded", function() {
     generateUI(json);

});
