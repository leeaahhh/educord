# Educord

Educord est un bot discord codé avec Node.js qui vous permet de consulter votre emploi du temps  et votre cahier de texte Ecole Directe dans Discord

Il intègre également des fonctionnalités de post automatique de l'emploi du temps, d'alertes en cas de cours modifiés ou annulés, et le support du multi-comptes

Ce bot a été conçu dans l'idée d'avoir une instance auto-hébergée par collège/lycée/école (pas de centralisation) avec un compte Ecole Directe par classe configuré (pas besoin d'un compte par personne)

## Confidentialité

Lors de votre utilisation de ce bot, vos identifiants Ecole Directe restent stockés uniquements sur votre machine, et ne sont envoyés qu'à Ecole Directe (nécessaire pour se connecter et accéder à votre emploi du temps/cahier de texte)

N'importe quelle personne présente sur un serveur où le bot est présent aura accès aux emplois du temps et cahiers de texte de l'intégralité des comptes du bot

Je ne suis en aucun cas responsable de votre utilisation de votre compte école directe, ni de quelconque sanction pouvant en découler

## Installation

1. Clonez ce dépôt avec git clone ou bien téléchargez-le en .zip
2. Exécutez la commande "npm i" dans le dossier (Node.js requis)
3. Changez le token et les comptes Ecole Directe dans conf.json

⚠️ **Important** : Vous devez activer l'option "message content inetent" dans le panel développeur de discord pour que le bot fonctionne !

4. Lancez le bot avec "node ./index.js"
5. Votre bot est en ligne 🥳


Les PRs sont bienvenues ! 👍

## Dépendances

Discord.js : https://discord.js.org/#/

ecoledirecte.js : https://github.com/a2br/ecoledirecte.js

