# Phishing Quest 🎣

Petit jeu mobile pour apprendre à reconnaître les emails de phishing.
Application développée avec [Expo](https://expo.dev/) (React Native).

Ce guide explique comment lancer le projet sur un téléphone via **Expo Go**.

## Prérequis

- **Node.js** (version 18 ou plus) installé sur l'ordinateur — à télécharger sur [nodejs.org](https://nodejs.org/).
- L'application **Expo Go** installée sur le téléphone :
  - Android : [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - iPhone : [App Store](https://apps.apple.com/app/expo-go/id982107779)
- Le téléphone et l'ordinateur doivent être connectés au **même réseau Wi-Fi**.

## Installation

Dans un terminal, depuis le dossier du projet :

```bash
npm install
```

Cette commande télécharge les dépendances. Elle n'est à lancer qu'une seule fois.

## Lancer le projet

```bash
npm start
```

Un **QR code** s'affiche alors dans le terminal.

## Ouvrir l'app sur le téléphone

1. Ouvrir l'application **Expo Go** sur le téléphone.
2. Scanner le **QR code** affiché dans le terminal :
   - **Android** : utiliser le bouton « Scan QR code » dans Expo Go.
   - **iPhone** : utiliser l'appareil photo, puis toucher la notification qui apparaît.
3. L'application se charge et démarre automatiquement. 🎉

> Astuce : pour arrêter le serveur, appuyer sur `Ctrl + C` dans le terminal.
