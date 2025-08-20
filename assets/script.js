  const grid = document.getElementById("grid");
    const toast = document.getElementById("toast");
    const input = document.getElementById("search");

    // Utilities
    const showToast = (msg) => {
      toast.textContent = msg;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2200);
    };

    const createSkeletonCard = () => {
      const wrap = document.createElement("div");
      wrap.className = "card";
      wrap.innerHTML = `
        <span class="badge">Loading</span>
        <div class="skeleton avatar"></div>
        <div class="skeleton line"></div>
        <div class="skeleton line small"></div>
        <div class="row" style="margin-top:14px;">
          <div class="chip skeleton" style="height:34px;"></div>
          <div class="chip skeleton" style="height:34px;"></div>
        </div>
      `;
      return wrap;
    };

    const renderUser = (user) => {
      const full = `${user.name.first} ${user.name.last}`;
      const country = user.location.country;
      const email = user.email;
      const city = user.location.city;
      const card = document.createElement("div");
      card.className = "card";
      card.setAttribute("data-name", full.toLowerCase());
      card.setAttribute("data-country", country.toLowerCase());
      card.innerHTML = `
        <span class="badge">${country}</span>
        <div class="avatar">
          <img src="${user.picture.large}" alt="${full}" loading="lazy"/>
        </div>
        <h3 class="name">${full}</h3>
        <p class="meta"><b>Email:</b> ${email}</p>
        <p class="meta"><b>City:</b> ${city}</p>
        <div class="row">
          <div class="chip">Gender: ${user.gender}</div>
          <div class="chip">Age: ${user.dob.age}</div>
        </div>
      `;
      return card;
    };

    const filterCards = () => {
      const q = input.value.trim().toLowerCase();
      const cards = grid.querySelectorAll(".card");
      cards.forEach(c => {
        if (!q) { c.style.display = ""; return; }
        const name = c.getAttribute("data-name") || "";
        const country = c.getAttribute("data-country") || "";
        c.style.display = (name.includes(q) || country.includes(q)) ? "" : "none";
      });
    };

    input.addEventListener("input", filterCards);

    // Fetch via Fetch API
    async function getUserFetch() {
      const sk = createSkeletonCard();
      grid.prepend(sk);
      try {
        const res = await fetch("https://randomuser.me/api/");
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        sk.replaceWith( renderUser(data.results[0]) );
      } catch (e) {
        sk.remove();
        showToast("Fetch error: " + e.message);
        console.error(e);
      }
    }

    // Fetch via Axios
    async function getUserAxios() {
      const sk = createSkeletonCard();
      grid.prepend(sk);
      try {
        const { data } = await axios.get("https://randomuser.me/api/");
        sk.replaceWith( renderUser(data.results[0]) );
      } catch (e) {
        sk.remove();
        showToast("Axios error: " + e.message);
        console.error(e);
      }
    }

    // Helpers for batch
    async function getMultiple(n = 3) {
      const holders = Array.from({ length: n }, () => {
        const s = createSkeletonCard();
        grid.prepend(s);
        return s;
      });
      try {
        const { data } = await axios.get(`https://randomuser.me/api/?results=${n}`);
        data.results.forEach((u, i) => {
          holders[i].replaceWith( renderUser(u) );
        });
      } catch (e) {
        holders.forEach(h => h.remove());
        showToast("Batch load failed");
      }
    }

    // Buttons
    document.getElementById("btnFetch").addEventListener("click", getUserFetch);
    document.getElementById("btnAxios").addEventListener("click", getUserAxios);
    document.getElementById("btnThree").addEventListener("click", () => getMultiple(3));
    document.getElementById("btnClear").addEventListener("click", () => grid.innerHTML = "");

    // Initial load
    getUserFetch();