# Étape 1 : base d'image
FROM node:20

# Étape 2 : créer un dossier pour ton app
WORKDIR /app

# Étape 3 : copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Étape 4 : installer les dépendances
RUN npm install

# Étape 5 : copier le reste du code
COPY . .

# Étape 6 : exposer le port (ex: 3001)
EXPOSE 3001

# Étape 7 : commande pour démarrer l’app
CMD ["node", "index.js"]
