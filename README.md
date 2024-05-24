<h2>Dette må gjøres aller først: </h2>
<ol>
 <li> Installer <a href="https://nodejs.org/en">Node.js</a></li>
<li>Opprett ei mappe til prosjektet</li>
<li> Kjør kommandoen <code>npm init -y </code> i mappa</li>
<li> Kjør kommandoen <code>npm install sqlite3 express ejs bcrypt sqlite express-session</code></li>
 <li>Opprett ei databasefil (database.db) (td. i SQLiteStudio). Denne må ligge i prosjektmappa di. </li>
 <li>Last ned eksempelkoden og prøv deg fram.</li>
</ol>

<h2>Dette må du endre/sjekke før du starter: </h2>
<ul>
 <li>Filene du trenger å konsentrere deg om er: index.js og filene i views og public-mappene. Du trenger ikkje tenke på dei andre filene. </li>
 <li>Filene som ligger i "views"-mappa, er dei sidene som viser informasjonen på nettsida. Dei er skrevet i HTML og bruker ejs for å skrive JavaScript for å hente informasjon frå databaser.</li>
</ul>


<h2>Starte applikasjonen: </h2>
<ul>
 <li>Bruk CMD (command prompt) og naviger til mappa.</li>
 <li>Kommando: node index.js</li>
</ul>


<h2>Styling:</h2> 

 Lenke til css : ... href="/style.css" <br>
 Denne må inn i .ejs filene der du ønsker å ha css (akkurat slik som i vanlige HTML-filer, bortsett fra at du ikkje trenger /public med)


<h2>Bilder:</h2> 
Bildefiler må inn i public-mappa. Gjerne i ei mappe som heiter images. (public/images)

