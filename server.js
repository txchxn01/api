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

app.get("/GET/configs/:id", (req, res) => {
  const id = Number(req.params.id);

  axios
    .get(url)
    .then((response) => {
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
      });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      res.status(500).send("Error fetching data");
    });
});

app.get("/GET", (req, res) => {
  axios
    .get(url)
    .then((response) => {
      let data = response.data.data;

      if (!data.max_speed) {
        data.max_speed = 100;
      } else if (data.max_speed > 110) {
        data.max_speed = 110;
      }
      res.send(data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      res.status(500).send("Error fetching data");
    });
});
app.get("/GET/logs", (req, res) => {
    axios
      .get(url2)
      .then((response) => {

        let data = response.data.items;
  
        let logs = data.map(item => ({
          drone_id: item.drone_id,
          drone_name: item.drone_name,
          created: item.created,
          country: item.country,
          celsius: item.celsius,
        }));
  
        res.send(logs);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        res.status(500).send("Error fetching data");
      });
  });
app.get("/GET/status/:id", (req, res) => {
  const id = Number(req.params.id);
  axios
    .get(url)
    .then((response) => {
      const data = response.data.data;

      const drone = data.find((d) => d.drone_id === id);

      if (!drone) {
        return res.status(404).send({ error: "drone_id not found" });
      }

      res.send({ condition: drone.condition });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      res.status(500).send("Error fetching data");
    });
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
