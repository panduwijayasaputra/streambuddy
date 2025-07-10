#!/usr/bin/env ts-node
import axios from "axios";

const BASE_URL =
  process.env.TEST_API_URL ||
  "http://localhost:3001/api/chat-processing/templates";

async function main() {
  console.log("\n--- Template Response CRUD Test ---\n");

  // 1. List all templates
  const listRes = await axios.get(BASE_URL);
  console.log("List templates:", listRes.data.length, "found");

  // 2. Create a new template
  const newTemplate = {
    gameContext: "test-game",
    keywords: ["test", "crud", "template"],
    response: "This is a test template response.",
    priority: 1,
    isActive: true,
    metadata: { language: "id", category: "test" },
  };
  const createRes = await axios.post(BASE_URL, newTemplate);
  console.log("Created template:", createRes.data.id);

  // 3. Get the created template by ID
  const getRes = await axios.get(`${BASE_URL}/${createRes.data.id}`);
  console.log("Fetched template:", getRes.data);

  // 4. Update the template
  const updateRes = await axios.put(`${BASE_URL}/${createRes.data.id}`, {
    response: "This is an updated test template response.",
    priority: 2,
  });
  console.log("Updated template:", updateRes.data.response);

  // 5. Delete the template
  const deleteRes = await axios.delete(`${BASE_URL}/${createRes.data.id}`);
  console.log("Deleted template:", deleteRes.data);

  // 6. Validate all templates
  const validateRes = await axios.get(`${BASE_URL}/validate/all`);
  console.log("Validation result:", validateRes.data);

  console.log("\n--- CRUD Test Complete ---\n");
}

main().catch((err) => {
  if (err.response) {
    console.error("API Error:", err.response.data);
  } else {
    console.error("Error:", err.message);
  }
  process.exit(1);
});
