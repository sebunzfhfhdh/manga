<p align="center">

<p align="center">
	<img src="https://img.shields.io/github/license/sebunzfhfhdh/manga?style=for-the-badge&logo=opensourceinitiative&logoColor=white&color=ffcc00" alt="license">
	<img src="https://img.shields.io/github/last-commit/sebunzfhfhdh/manga?style=for-the-badge&logo=git&logoColor=white&color=ffcc00" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/sebunzfhfhdh/manga?style=for-the-badge&color=ffcc00" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/sebunzfhfhdh/manga?style=for-the-badge&color=ffcc00" alt="repo-language-count">
</p>
<p align="center">Built with the tools and technologies:</p>
<p align="center">
	<img src="https://img.shields.io/badge/Express-000000.svg?style=for-the-badge&logo=Express&logoColor=white" alt="Express">
	<img src="https://img.shields.io/badge/npm-CB3837.svg?style=for-the-badge&logo=npm&logoColor=white" alt="npm">
	<img src="https://img.shields.io/badge/HTML5-E34F26.svg?style=for-the-badge&logo=HTML5&logoColor=white" alt="HTML5">
	<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=for-the-badge&logo=JavaScript&logoColor=black" alt="JavaScript">
	<img src="https://img.shields.io/badge/Axios-5A29E4.svg?style=for-the-badge&logo=Axios&logoColor=white" alt="Axios">
</p>
<br>

## 🔗 Quick Links

- [🚀 Getting Started](#-getting-started)
  - [☑️ Prerequisites](#-prerequisites)
  - [⚙️ Installation](#-installation)
  - [🤖 Usage](#🤖-usage)
  - [🧪 Testing](#🧪-testing)
- [🔰 Contributing](#-contributing)
---

---
## 🚀 Getting Started

### ☑️ Prerequisites

Before getting started with manga, ensure your runtime environment meets the following requirements:

- **Programming Language:** JavaScript
- **Package Manager:** Npm


### ⚙️ Installation

Install manga using one of the following methods:

**Build from source:**

1. Clone the manga repository:
```sh
❯ git clone https://github.com/sebunzfhfhdh/manga
```

2. Navigate to the project directory:
```sh
❯ cd manga
```

3. Install the project dependencies:


**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm install
```



### 🤖 Usage
Run manga using the following command:
**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm start
```

## 📡 API Endpoints

### 📘 Manga Endpoints

- `GET /manga`: Retrieve a list of all manga titles.
- `GET /manga/:id`: Get detailed information about a specific manga by its ID.
- `GET /manga/:id/chapter`: Retrieve a list of all chapters for a manga.
- `GET /manga/:id/chapter/:num`: Get detailed information about a specific chapter by its manga ID and chapter number.

### 🔎 Search Endpoints

- `GET /search?q=''&type=''&status=''&genre=''`: Search for a specific manga based on query parameters like type, status, and genre.

### 🆕 Additional Endpoints

- `GET /latest`: Get the latest manga.
- `GET /popular`: Get the most popular mangas.

## 💻 Example API Calls

### 📚 Fetch All Manga

```javascript
fetch('http://localhost:3000/api/manga')
  .then(response => response.json())
  .then(data => console.log(data));
```

### 📘 Get Manga by ID

```javascript
fetch('http://localhost:3000/api/manga/1')
  .then(response => response.json())
  .then(data => console.log(data));
```

### 📖 Fetch All Chapters for a Manga

```javascript
fetch('http://localhost:3000/api/manga/1/chapter')
  .then(response => response.json())
  .then(data => console.log(data));
```

### 📄 Get Specific Chapter Details

```javascript
fetch('http://localhost:3000/api/manga/1/chapter/5')
  .then(response => response.json())
  .then(data => console.log(data));
```

### 🔍 Search for Manga

```javascript
fetch('http://localhost:3000/api/search?q=ninja&type=manga&status=ongoing&genre=action')
  .then(response => response.json())
  .then(data => console.log(data));
```

### 🆕 Fetch the Latest Manga

```javascript
fetch('http://localhost:3000/api/latest')
  .then(response => response.json())
  .then(data => console.log(data));
```

### 🌟 Fetch the Most Popular Manga

```javascript
fetch('http://localhost:3000/api/popular')
  .then(response => response.json())
  .then(data => console.log(data));
```




### 🧪 Testing
Run the test suite using the following command:
**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm test
```

## 🔰 Contributing

- **💬 [Join the Discussions](https://github.com/sebunzfhfhdh/manga/discussions)**: Share your insights, provide feedback, or ask questions.
- **🐛 [Report Issues](https://github.com/sebunzfhfhdh/manga/issues)**: Submit bugs found or log feature requests for the `manga` project.
- **💡 [Submit Pull Requests](https://github.com/sebunzfhfhdh/manga/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.

<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your github account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.
   ```sh
   git clone https://github.com/sebunzfhfhdh/manga
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to github**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!


<summary>Contributors</summary>
<br>
<p align="left">
   <a href="https://github.com{/sebunzfhfhdh/manga/}graphs/contributors">
      <img src="https://contrib.rocks/image?repo=sebunzfhfhdh/manga">
   </a>
</p>
