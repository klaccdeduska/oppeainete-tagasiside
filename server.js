require("dotenv").config();

const http = require("http");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const port = process.env.PORT || 3000;
const dir = __dirname;

// MariaDB
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

function send(res, status, body, type = "application/json") {
    res.writeHead(status, {
        "Content-Type": type
    });

    res.end(body);
}

const server = http.createServer(async (req, res) => {

    // Получить все отзывы
    if (req.url === "/api/feedback" && req.method === "GET") {
        try {
            const [rows] = await db.execute(`
                SELECT
                    f.id,
                    f.student_name AS name,
                    f.class_name AS className,
                    s.name AS subject,
                    f.rating,
                    f.comment,
                    DATE_FORMAT(f.created_at, '%d.%m.%Y') AS date,
                    f.created_at AS createdAt
                FROM feedback f
                JOIN subjects s ON f.subject_id = s.id
                ORDER BY f.created_at DESC
            `);

            return send(res, 200, JSON.stringify(rows));

        } catch (error) {
            console.error(error);

            return send(
                res,
                500,
                JSON.stringify({ error: "Database error" })
            );
        }
    }

    // Добавить новый отзыв
    if (req.url === "/api/feedback" && req.method === "POST") {
        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", async () => {
            try {
                const item = JSON.parse(body);

                // Находим ID предмета
                const [subjects] = await db.execute(
                    "SELECT id FROM subjects WHERE name = ?",
                    [item.subject]
                );

                if (subjects.length === 0) {
                    return send(
                        res,
                        400,
                        JSON.stringify({ error: "Subject not found" })
                    );
                }

                // Сохраняем отзыв
                await db.execute(
                    `INSERT INTO feedback
                    (student_name, class_name, subject_id, rating, comment)
                    VALUES (?, ?, ?, ?, ?)`,
                    [
                        item.name,
                        item.className,
                        subjects[0].id,
                        item.rating,
                        item.comment || null
                    ]
                );

                return send(
                    res,
                    201,
                    JSON.stringify({ success: true })
                );

            } catch (error) {
                console.error(error);

                return send(
                    res,
                    500,
                    JSON.stringify({ error: "Database error" })
                );
            }
        });

        return;
    }

    // Отдаём HTML / CSS / JS
    const filePath = path.join(
        dir,
        req.url === "/" ? "index.html" : req.url
    );

    if (!fs.existsSync(filePath)) {
        return send(res, 404, "Not found", "text/plain");
    }

    const ext = path.extname(filePath);

    const types = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/javascript"
    };

    send(
        res,
        200,
        fs.readFileSync(filePath),
        types[ext] || "text/plain"
    );
});

server.listen(port, () => {
    console.log(`Server started: http://localhost:${port}`);
});