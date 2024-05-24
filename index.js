import express from 'express';
import session from 'express-session';
import { open } from "sqlite";
import sqlite3 from 'sqlite3'
import bcrypt from 'bcrypt'

const dbPromise = open({
    filename: 'data.db',
    driver: sqlite3.Database
});

const app = express();
const port = 3000;

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Routes will be added here

app.listen(port, () => {
    console.log(`Server er startet her: http://localhost:${port}`);
});
app.get('/', (req, res) => {
    let loggedin = req.session.loggedin;
    let admin = req.session.admin;
    res.render('index', { loggedin, admin });
});

app.get('/prices', (req, res) => {
    let loggedin = req.session.loggedin;
    let admin = req.session.admin;
    res.render('prices', {loggedin, admin});
}); 

app.get('/login', (req, res) => {
    let loggedin = req.session.loggedin;
    res.render('login', { loggedin });
});

app.get('/ansatte', (req, res) => {
    let loggedin = req.session.loggedin;
    res.render('ansatte', { loggedin });
});

app.get('/courses', (req, res) => {
    let loggedin = req.session.loggedin;
    res.render('courses', { loggedin });
});

app.get('/classes', (req, res) => {
    let loggedin = req.session.loggedin;
    res.render('classes', { loggedin });
});

app.get('/contact', (req, res) => {
    let loggedin = req.session.loggedin;
    let admin = req.session.admin;
    res.render('contact', { loggedin, admin});
});

app.get('/thankyou', (req, res) => {
    let loggedin = req.session.loggedin;
    res.render('thankyou', { loggedin });
});
// Rute for å hente alle kursene
app.get('/courseoverview', async (req, res) => {
    // Hent innloggingsstatus og admin-status fra sesjonen
    let loggedin = req.session.loggedin;
    let admin = req.session.admin; 
    
    console.log("Starting query..."); // Logge at spørringen starter

    // Definer SQL-spørringen som skal hente data fra courseoverview-tabellen
    const query = `
        SELECT coursename, p_firstname, p_lastname, p_email, p_mobile
        FROM courseoverview
    `;

    // Sjekk om brukeren er admin
    if (admin) {
        const db = await dbPromise; // Vent på at databaseforbindelsen skal være tilgjengelig
        const rows = await db.all(query); // Utfør SQL-spørringen og vent på resultatene
        
        console.log(rows); // Logge resultatene fra databasen
    
        console.log("Query completed. Processing data..."); // Logge at spørringen er fullført og dataene skal behandles

        // Initialiser et tomt objekt for å lagre kursene og deltakerne
        let courses = {};

        // Iterer gjennom hver rad (kursdeltaker) fra resultatet av SQL-spørringen
        rows.forEach(row => {
            // Sjekk om kurset allerede er lagt til i courses-objektet
            if (!courses[row.coursename]) {
                // Hvis ikke, initialiser kurset med en tom deltakerliste og teller
                courses[row.coursename] = {
                    participants: [],
                    count: 0
                };
            }
            // Legg til deltakerens informasjon i deltakerlisten for kurset
            courses[row.coursename].participants.push({
                firstname: row.p_firstname,
                lastname: row.p_lastname,
                email: row.p_email,
                mobile: row.p_mobile
            });
            // Øk deltakertelleren for kurset
            courses[row.coursename].count++;
        });

        console.log("Data processed. Rendering page..."); // Logge at dataene er behandlet og siden skal rendres
        
        // Render EJS-malen courseoverview med kursdataene (courses) og innloggingsstatusen (loggedin)
        res.render('courseoverview', { courses: courses, loggedin });
    } else {
        // Hvis brukeren ikke er admin, send en 400-statuskode med meldingen "Not authorized"
        res.status(400);
        res.send("Not authorized");
    }
});

app.get("/register", async (req, res) => {
    let loggedin = req.session.loggedin;
    res.render('register', { loggedin });
})

app.post("/register", async (req, res) => {
    const db = await dbPromise;

    const { fname, lname, email, courses, mobile } = req.body;

    // Tabellen eg bruker heiter "users" og har kolonnene "firstname", "lastname", "email" og "password"
    await db.run("INSERT INTO courseoverview (coursename, p_firstname, p_lastname, p_email, p_mobile) VALUES (?, ?, ?, ?, ?)", courses, fname, lname, email, mobile);

    res.redirect("thankyou");

})

app.post('/auth', async function (req, res) {

    const db = await dbPromise;

    const { email, password } = req.body;
    let getUserDetails = `SELECT * FROM users WHERE email = '${email}'`;
    let checkInDb = await db.get(getUserDetails);
    if (checkInDb === undefined) {
        const errorCode = "403";
        const errorMessage = "Ingen bruker registert." 

        res.render('error', {errorCode, errorMessage});
    } else {
        const isPasswordMatched = await bcrypt.compare(
            password,
            checkInDb.password
        );

        if (isPasswordMatched) {
            res.status(200);
            if (checkInDb.role == 1) { // ADMIN SYSTEM
                req.session.admin = true;
            }
            // If the account exists
            // Authenticate the user
            req.session.loggedin = true;
            req.session.email = email;
            req.session.userid = checkInDb.id; 
            // Redirect to home page
            res.redirect('/');
        } else {
             res.status(400);
             res.send("Feil passord");
        }

    }

});

app.get("/logout", async (req, res) => {

    req.session.loggedin = false;
    req.session.username = '';
    req.session.admin = false; // ADMIN SYSTEM
    res.redirect("/")
})

// ADMIN SYSTEM
app.get('/admin', async function (req, res) {
    if (req.session.loggedin) {
        let loggedin = req.session.loggedin;
        const user = req.session.email;
        const db = await dbPromise;
        let getUserDetails = `SELECT * FROM users WHERE email = '${user}' AND role = 1`;
        let checkInDb = await db.get(getUserDetails);
        const query = 'SELECT * FROM users';
        const users = await db.all(query);
        if (checkInDb === undefined) {
            res.status(400);
            res.send("Invalid user");
        } else {
            let admin = true;
            res.status(200);
            res.render('admin', { user, admin, users, loggedin});
        }
    }
    else {
        res.status(400);
        res.send("Not authorized");
    }
});
