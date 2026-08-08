# Access & Mobility — Bornes de péage, interopérabilité matérielle et XOF

## Principe impératif

Mansa ne dépend d'aucune marque ni d'aucun modèle de borne. Le logiciel doit rester hardware-agnostic et fonctionner avec des bornes existantes ou futures dès lors qu'un protocole, SDK, API ou adaptateur matériel permet leur intégration.

L'architecture cible est :

`Mansa → Mansa Kiosk Gateway → adaptateur constructeur/protocole → périphériques de la borne`.

Les intégrations peuvent utiliser selon le matériel : API HTTP/REST, SDK constructeur, Ethernet/TCP-IP, USB, série RS-232/RS-485, MDB, Pulse, GPIO/relais/contact sec ou autre protocole documenté. Une borne propriétaire non interopérable peut nécessiter une passerelle spécifique.

## Profil de borne recommandé pour les nouveaux péages

Pour un nouveau déploiement public, le profil recommandé est une borne extérieure de péage double hauteur afin de servir voitures, utilitaires, bus et poids lourds depuis la même voie.

Elle doit pouvoir intégrer :

- interface basse pour voitures ;
- interface haute pour bus et poids lourds ;
- écran lisible en extérieur ;
- paiement carte EMV avec puce, sans-contact/NFC et réseaux supportés par l'acquéreur ;
- scanner QR 2D pour QR Mansa et autres usages autorisés ;
- QR dynamique affichable à l'écran ;
- Mobile Money activable/désactivable par configuration ;
- validateur de billets ;
- validateur de pièces ;
- recyclage/rendu de monnaie en billets et/ou pièces selon configuration ;
- imprimante de reçu ;
- interphone/aide ;
- coffre sécurisé ;
- connectivité Ethernet et options cellulaires/Wi-Fi selon site ;
- alimentation secourue/UPS lorsque nécessaire ;
- contrôleur local pour fonctionnement dégradé ;
- connexion aux barrières et capteurs ;
- connexion au RFID UHF et à l'ANPR sans rendre ces technologies obligatoires pour un paiement ponctuel.

## Exigence XOF / FCFA BCEAO

Aucune borne ne doit être déclarée compatible FCFA uniquement parce qu'elle accepte des espèces dans une autre devise.

Avant achat ou déploiement au Mali, le fournisseur doit confirmer par écrit et faire valider en recette la compatibilité des modules espèces avec le XOF/BCEAO :

- coupures de billets XOF acceptées ;
- pièces XOF acceptées ;
- authentification/rejet des billets non reconnus ou suspects ;
- authentification/rejet des pièces non reconnues ;
- firmware/dataset monétaire compatible XOF ;
- rendu de monnaie XOF ;
- coupures utilisées pour le rendu ;
- capacité des recycleurs/hoppers ;
- procédure de mise à jour lors d'un changement de série monétaire ;
- taux de reconnaissance et tests jour/nuit/température/poussière adaptés au site.

La décision d'acceptation d'un billet ou d'une pièce est assurée par le validateur monétique certifié/configuré ; Mansa reçoit la valeur et le statut du périphérique et orchestre la transaction. Mansa ne doit pas implémenter une détection artisanale des faux billets.

## Rendu de monnaie

Le moteur doit supporter plusieurs stratégies configurables :

- rendu exact obligatoire ;
- rendu en pièces ;
- rendu en billets ;
- rendu mixte billets + pièces ;
- paiement exact seulement lorsque les recycleurs sont indisponibles ;
- désactivation temporaire du cash si aucun rendu sûr n'est possible.

Avant d'accepter une transaction espèces, le contrôleur vérifie si la monnaie nécessaire peut être rendue selon la politique. Le solde des cassettes/recycleurs est remonté au portail avec seuils d'alerte.

## Détection des capacités

Chaque borne possède un profil de capacités. Exemples :

`CARD`, `NFC`, `QR_SCANNER`, `QR_DISPLAY`, `MOBILE_MONEY`, `CASH_BILL`, `CASH_COIN`, `CHANGE_BILL`, `CHANGE_COIN`, `RECEIPT_PRINTER`, `INTERCOM`, `RFID`, `ANPR`.

L'interface Mansa n'affiche que les moyens réellement disponibles et opérationnels sur la borne concernée. RFID n'est pas présenté comme un bouton de paiement lorsqu'il fonctionne comme identification automatique d'un abonnement.

## Paiement ponctuel

Si aucun abonnement automatique valide n'est détecté, l'écran affiche le montant et uniquement les moyens disponibles, par exemple : carte, QR Mansa, Mobile Money et espèces. Après confirmation du paiement, le contrôleur autorise l'ouverture de la barrière.

## RFID et ANPR

Pour un véhicule abonné, RFID UHF + plaque ANPR peuvent fonctionner automatiquement avant toute interaction avec l'écran. L'association tag-véhicule-plaque-abonnement est vérifiée par Mansa. Une politique peut autoriser RFID seul, plaque seule, RFID + plaque obligatoire ou un mode dégradé contrôlé.

## Compatibilité avec les bornes déjà détenues par un client

Lors de l'onboarding, Mansa inventorie : constructeur, modèle, firmware, OS/contrôleur, interfaces disponibles, périphériques, protocoles et documentation technique. Un test de compatibilité détermine ensuite :

- intégration native ;
- adaptateur logiciel existant ;
- passerelle matérielle ;
- remplacement d'un périphérique seulement ;
- incompatibilité documentée.

Le client n'est donc pas obligé d'acheter une borne Mansa.

## Abstractions logicielles

Interfaces recommandées :

```text
KioskProvider
PaymentTerminalProvider
CashBillValidatorProvider
CashCoinValidatorProvider
CashRecyclerProvider
QrScannerProvider
ReceiptPrinterProvider
IntercomProvider
ANPRProvider
RFIDReaderProvider
BarrierProvider
LaneControllerProvider
VehicleSensorProvider
```

Chaque adaptateur doit publier ses capacités, son état de santé et ses erreurs normalisées.

## Pannes et écran

Une panne d'un périphérique ne ferme pas nécessairement toute la borne. Exemple : si le monnayeur est indisponible mais carte et QR fonctionnent, l'écran retire le cash et informe l'usager. Si le rendu de monnaie est impossible, le système peut passer en paiement exact ou désactiver les espèces selon la politique.

Les statuts et messages doivent être synchronisés avec le moteur Access & Mobility : ACTIVE, SUSPENDED, MAINTENANCE, DEGRADED, CLOSED et DISABLED.

## Achat et appels d'offres

Les modèles de fabricants cités dans les études ou démonstrations ne sont que des références de marché et ne constituent pas une dépendance technique ni une affirmation de compatibilité XOF. Le prix final d'une borne industrielle complète doit provenir d'un devis fournisseur correspondant exactement aux modules demandés.

Pour tout appel d'offres, la conformité XOF/BCEAO, le double niveau, le rendu de monnaie, les protocoles d'intégration, la disponibilité des SDK/API, la maintenance, les pièces détachées et la recette d'interopérabilité Mansa doivent être des critères contractuels.
