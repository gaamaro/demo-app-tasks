package main

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("segredo_top_d+_123") // Pode usar via env depois

func main() {
	app := fiber.New()

	// --- CORS para frontend acessar ---
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3002", // frontend
		AllowHeaders: "Origin, Content-Type, Authorization",
	}))

	// --- Criar usuário ---
	app.Post("/users", func(c *fiber.Ctx) error {
		var body struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Dados inválidos"})
		}

		// Proxy para backend Node via NGINX LB
		userPayload, _ := json.Marshal(body)
		resp, err := http.Post("http://nginx_lb/users", "application/json", bytes.NewBuffer(userPayload))
		if err != nil || resp.StatusCode != 200 {
			return c.Status(500).JSON(fiber.Map{"error": "Erro ao cadastrar usuário"})
		}
		defer resp.Body.Close()

		var backendResp map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&backendResp)
		return c.JSON(backendResp)
	})

	// --- Login ---
	app.Post("/login", func(c *fiber.Ctx) error {
		var body struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Dados inválidos"})
		}

		// Valida no backend
		loginPayload, _ := json.Marshal(body)
		resp, err := http.Post("http://nginx_lb/login", "application/json", bytes.NewBuffer(loginPayload))
		if err != nil || resp.StatusCode != 200 {
			return c.Status(401).JSON(fiber.Map{"error": "Credenciais inválidas"})
		}
		defer resp.Body.Close()

		var backendResp struct {
			UserID int `json:"userId"`
		}
		json.NewDecoder(resp.Body).Decode(&backendResp)

		// Gera JWT
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"userId": backendResp.UserID,
			"email":  body.Email,
			"exp":    time.Now().Add(time.Hour * 2).Unix(),
		})
		tokenString, err := token.SignedString(jwtSecret)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Erro ao gerar token"})
		}

		return c.JSON(fiber.Map{"token": tokenString})
	})

	// --- Listar tasks ---
	app.Get("/tasks", jwtMiddleware, func(c *fiber.Ctx) error {
		resp, err := http.Get("http://nginx_lb/tasks")
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Erro ao buscar tasks"})
		}
		defer resp.Body.Close()
		bodyResp, _ := ioutil.ReadAll(resp.Body)
		return c.Send(bodyResp)
	})

	// --- Criar task ---
	app.Post("/tasks", jwtMiddleware, func(c *fiber.Ctx) error {
		resp, err := http.Post("http://nginx_lb/tasks", "application/json", bytes.NewBuffer(c.Body()))
		if err != nil || resp.StatusCode != 200 {
			return c.Status(500).JSON(fiber.Map{"error": "Erro ao criar task"})
		}
		defer resp.Body.Close()
		bodyResp, _ := ioutil.ReadAll(resp.Body)
		return c.Send(bodyResp)
	})

	// --- Atualizar task ---
	app.Put("/tasks/:id", jwtMiddleware, func(c *fiber.Ctx) error {
		id := c.Params("id")
		req, err := http.NewRequest(http.MethodPut, "http://nginx_lb/tasks/"+id, bytes.NewBuffer(c.Body()))
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Erro ao preparar requisição"})
		}
		req.Header.Set("Content-Type", "application/json")
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil || resp.StatusCode != 200 {
			return c.Status(500).JSON(fiber.Map{"error": "Erro ao atualizar task"})
		}
		defer resp.Body.Close()
		bodyResp, _ := ioutil.ReadAll(resp.Body)
		return c.Send(bodyResp)
	})

	// --- Remover task ---
	app.Delete("/tasks/:id", jwtMiddleware, func(c *fiber.Ctx) error {
		id := c.Params("id")
		req, err := http.NewRequest(http.MethodDelete, "http://nginx_lb/tasks/"+id, nil)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Erro ao preparar requisição"})
		}
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil || resp.StatusCode != 200 {
			return c.Status(500).JSON(fiber.Map{"error": "Erro ao remover task"})
		}
		defer resp.Body.Close()
		return c.SendStatus(200)
	})

	// Health Check
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("API Go com JWT no ar! 🔐")
	})

	log.Println("API Go rodando na porta 3000 🚀")
	log.Fatal(app.Listen(":3000"))
}

// --- Middleware JWT ---
func jwtMiddleware(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Token não informado"})
	}

	tokenString := authHeader[len("Bearer "):]
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return c.Status(401).JSON(fiber.Map{"error": "Token inválido"})
	}

	return c.Next()
}
