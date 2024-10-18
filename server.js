const axios = require("axios");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const url =
  "https://script.googleusercontent.com/macros/echo?user_content_key=LNVFjOFyt7uVGdh9GjFmTtUjpJGAGcPqxfQ7ZlS0z0YXzN-q4VxyckLPNEpmfsakqX67xjIvt3R_upKHZrcA66yl7C3zdg7sm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnOQwROx_Wq-O5wsPy5w5JUsdPdcpj8TWgjjVAuN4sDTiMrnThHKU7n7LmNcslGllO5_ldGegmAJuXjfvqC1tFaecv-CYmXuM6Nz9Jw9Md8uu&lib=M9_yccKOaZVEQaYjEvK1gClQlFAuFWsxN";
const url2 =
  "https://app-tracking.pockethost.io/api/collections/drone_logs/records";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/configs/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const response = await axios.get(url);
    const data = response.data.data;

    const drone = data.find((d) => d.drone_id === id);

    if (!drone) {
      return res.status(404).send({ error: "drone_id not found" });
    }

    if (drone.max_speed == null) {
      drone.max_speed = 100;
    } else if (drone.max_speed > 110) {
      drone.max_speed = 110;
    }

    res.send({
      drone_id: drone.drone_id,
      drone_name: drone.drone_name,
      light: drone.light,
      country: drone.country,
      max_speed: drone.max_speed, 
      population:drone.population
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

app.get("/logs", async (req, res) => {
  try {
    const response = await axios.get(url2);
    let data = response.data.items;

    let logs = data.map((item) => ({
      drone_id: item.drone_id,
      drone_name: item.drone_name,
      created: item.created,
      country: item.country,
      celsius: item.celsius,
    }));

    res.send(logs);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

app.get("/status/:id", async (req, res) => {
  try {
    const response = await axios.get(url);
    const data = response.data.data;
    const id = Number(req.params.id);

    const drone = data.find((d) => d.drone_id === id);

    if (!drone) {
      return res.status(404).send({ error: "drone_id not found" });
    }

    res.send({ condition: drone.condition });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

app.post("/logs", async (req, res) => {
  const { celsius, drone_id, drone_name, country } = req.body;

  if (!celsius || !drone_id || !drone_name || !country) {
    return res
      .status(400)
      .send(
        "Missing required fields: celsius, drone_id, drone_name, or country"
      );
  }

  try {
    const { data } = await axios.post(
      { celsius, drone_id, drone_name, country },
      {
        celsius: celsius,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Insert complete");
    res.status(200).send("Insert complete");
  } catch (error) {
    console.error("Error: ", error.message);
    res.status(500).send("Error handling the data");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
