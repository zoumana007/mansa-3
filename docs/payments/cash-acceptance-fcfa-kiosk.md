# Mansa — Acceptation d’espèces FCFA, QR et périphériques de borne

## 1. Objectif

Ce cahier des charges définit le sous-système Mansa chargé de gérer les espèces FCFA/XOF, les périphériques physiques de borne, le QR et les mécanismes de validation nécessaires dans les péages, parkings, stations-service, postes de collecte, bornes de paiement et autres points de service.

Il complète les modules `Mansa État — Plateforme de péage et télépéage`, `Access & Mobility` et `POS`, sans les remplacer.

Le logiciel Mansa ne doit jamais supposer qu’un périphérique accepte le FCFA simplement parce qu’il accepte des espèces dans une autre devise. La compatibilité XOF/BCEAO doit être explicitement supportée, configurée et validée pour le matériel retenu.

## 2. Principes obligatoires

Le système doit respecter les principes suivants :

- architecture multi-fournisseurs ;
- aucun modèle de borne unique imposé dans le domaine métier ;
- adaptateurs matériels remplaçables ;
- compatibilité FCFA déclarée et testée avant mise en production ;
- aucune reconnaissance de billets faite uniquement par une caméra générique ;
- validation des billets et pièces confiée à des validateurs industriels spécialisés ;
- journalisation complète des événements monétaires ;
- rapprochement entre montant attendu, montant introduit, monnaie rendue et passage/service délivré ;
- fonctionnement hors ligne limité et sécurisé lorsque la politique l’autorise ;
- aucun double encaissement lors de la resynchronisation ;
- aucune donnée secrète de périphérique stockée dans Git.

## 3. Périphériques couverts

Le sous-système doit pouvoir intégrer au minimum :

```text
BillValidatorProvider
CoinValidatorProvider
BillRecyclerProvider
CoinRecyclerProvider
CashBoxProvider
QRScannerProvider
ReceiptPrinterProvider
PaymentTerminalProvider
RFIDReaderProvider
PeripheralHealthProvider
```

Le matériel peut être intégré par API locale, SDK, port série, USB, TCP/IP, RS232, RS485, MDB, ccTalk, contact sec ou autre protocole industriel documenté.

## 4. Validation des billets FCFA

Une borne acceptant les billets doit être équipée d’un validateur explicitement configuré pour les coupures FCFA/XOF qu’elle est autorisée à recevoir.

Le validateur industriel est responsable de la reconnaissance primaire du billet. Selon le matériel, il peut analyser plusieurs caractéristiques :

- dimensions ;
- orientation ;
- motifs optiques ;
- propriétés visibles et non visibles ;
- caractéristiques magnétiques ou électromagnétiques ;
- réponse spectrale ;
- éléments de sécurité supportés par le validateur ;
- profil de coupure fourni par le fabricant.

Mansa ne doit pas prétendre remplacer les mécanismes spécialisés du validateur par un simple traitement d’image logiciel.

## 5. Décision billet

Le périphérique doit retourner un résultat structuré, par exemple :

```text
ACCEPTED
REJECTED
SUSPECT
JAMMED
UNKNOWN_DENOMINATION
DISABLED_DENOMINATION
CASHBOX_FULL
DEVICE_ERROR
```

Pour un billet accepté, l’événement doit contenir au minimum :

- devise : `XOF` ;
- valeur nominale ;
- identifiant du périphérique ;
- identifiant de borne ;
- identifiant de transaction ;
- date/heure ;
- code résultat fabricant normalisé ;
- numéro de séquence local ;
- mode online/offline.

Exemple :

```json
{
  "status": "ACCEPTED",
  "currency": "XOF",
  "denomination": 5000,
  "terminalId": "TOLL-BKO-01-LANE-02",
  "transactionId": "..."
}
```

## 6. Billets suspects ou refusés

Un billet refusé ne doit jamais être crédité dans la transaction.

Selon le comportement matériel et la réglementation applicable, le périphérique peut :

- restituer immédiatement le billet ;
- retenir un billet marqué comme suspect lorsque le matériel et la politique le permettent légalement ;
- lever une alerte opérateur ;
- bloquer temporairement l’accepteur en cas de répétitions anormales.

La politique doit être configurable et ne doit jamais supposer que Mansa a le droit de confisquer un billet sans base légale ou procédure approuvée.

## 7. Profils de coupures

L’administration ou l’exploitant doit pouvoir activer ou désactiver certaines coupures par :

- pays ;
- réseau ;
- site ;
- borne ;
- voie ;
- périphérique ;
- période d’effet.

Exemple : une borne peut accepter certaines coupures mais en refuser d’autres si elle n’a plus assez de monnaie à rendre.

Les profils doivent être versionnés et audités.

## 8. Mise à jour des profils monétaires

Lorsqu’un fabricant publie un nouveau profil de reconnaissance de billets ou une mise à jour de firmware, Mansa doit pouvoir :

- identifier la version actuelle ;
- vérifier la compatibilité du modèle ;
- planifier le déploiement ;
- appliquer progressivement la mise à jour ;
- conserver la version précédente pour diagnostic ;
- journaliser l’opération ;
- empêcher une mise à jour non autorisée.

Les fichiers propriétaires ou clés fabricant ne doivent jamais être exposés publiquement dans Git.

## 9. Validation des pièces FCFA

Une borne acceptant des pièces doit utiliser un monnayeur/validateur configuré pour les pièces XOF réellement supportées par le fabricant.

Le validateur peut utiliser selon sa technologie :

- diamètre ;
- épaisseur ;
- masse indirecte ou comportement mécanique ;
- propriétés électromagnétiques ;
- vitesse de passage ;
- signatures mesurées par ses capteurs.

Le résultat doit être normalisé de manière similaire aux billets :

```text
ACCEPTED
REJECTED
UNKNOWN_COIN
DISABLED_DENOMINATION
JAMMED
DEVICE_ERROR
```

## 10. Reconnaissance de fausses pièces et objets étrangers

Un objet ne correspondant pas au profil d’une pièce autorisée doit être rejeté et retourné dans le bac de retour lorsque le matériel le permet.

Le système doit détecter des anomalies telles que :

- répétition élevée de rejets ;
- tentative d’introduction d’objets ;
- séquence de validation incohérente ;
- capteur bloqué ;
- monnayeur ouvert ou démonté ;
- volume anormal de rejets sur une borne précise.

Ces anomalies alimentent le moteur de risque et la maintenance.

## 11. Rendu de monnaie

Lorsqu’une borne doit rendre la monnaie, elle doit disposer de recycleurs ou distributeurs compatibles avec les coupures/pièces configurées.

Mansa doit connaître en temps quasi réel :

- stock par coupure ;
- stock par pièce ;
- capacité maximale ;
- seuil d’alerte ;
- montant disponible pour rendu ;
- montant réservé à des transactions en cours.

Avant de proposer le paiement en espèces, le système doit vérifier qu’il peut traiter le scénario selon sa politique.

Exemple :

```text
Tarif = 2 000 XOF
Client introduit = 5 000 XOF
Monnaie requise = 3 000 XOF
```

Si la borne ne peut pas rendre 3 000 XOF :

- elle ne doit pas finaliser silencieusement la transaction ;
- elle doit demander une autre coupure ou un autre moyen de paiement ;
- ou appliquer une politique approuvée par l’exploitant.

## 12. Politique `EXACT_AMOUNT_ONLY`

Une borne peut être configurée en mode :

```text
EXACT_AMOUNT_ONLY
CHANGE_SUPPORTED
AGENT_ASSISTED_CHANGE
```

En mode `EXACT_AMOUNT_ONLY`, l’écran doit clairement indiquer avant insertion que le montant exact est requis.

## 13. Transaction espèces

Une transaction espèces doit suivre un état explicite :

```text
CREATED
WAITING_FOR_CASH
PARTIALLY_PAID
AMOUNT_REACHED
CHANGE_PENDING
PAID
CANCELLED
REFUND_PENDING
FAILED
```

Le montant introduit est accumulé uniquement à partir d’événements `ACCEPTED` provenant des validateurs autorisés.

## 14. Annulation pendant insertion

Si l’utilisateur annule avant paiement complet :

- les billets/pièces recyclables doivent être restitués lorsque le matériel le permet ;
- sinon la borne doit suivre une procédure d’avoir/remboursement ou intervention agent ;
- toute différence doit être tracée ;
- l’écran doit indiquer clairement la suite.

Le système ne doit jamais perdre la trace d’argent physiquement accepté.

## 15. Coffres et cashboxes

Chaque cashbox/coffre physique doit avoir :

- identifiant unique ;
- borne associée ;
- périphérique associé ;
- capacité ;
- état ;
- scellé ou référence de sécurité si applicable ;
- date de dernière collecte ;
- agent(s) autorisé(s).

États possibles :

```text
EMPTY
IN_SERVICE
NEAR_FULL
FULL
REMOVED
SEALED
IN_TRANSIT
COUNTED
DISCREPANCY
```

## 16. Collecte sécurisée des espèces

Le processus de collecte doit enregistrer :

1. identification de l’agent ;
2. authentification renforcée si requise ;
3. borne ;
4. cashbox ;
5. heure d’ouverture ;
6. compteur logiciel attendu ;
7. retrait physique ;
8. pose éventuelle d’un nouveau coffre ;
9. scellement ;
10. transfert vers centre de comptage ;
11. montant compté ;
12. écart éventuel ;
13. approbation ou enquête.

Une ouverture de coffre sans session autorisée doit générer une alerte.

## 17. Rapprochement anti-corruption

Pour un péage ou service physique, Mansa doit pouvoir rapprocher :

```text
véhicule/service détecté
→ catégorie/tarif attendu
→ espèces acceptées
→ monnaie rendue
→ transaction validée
→ commande ouverture
→ ouverture réelle
→ passage physique
→ reçu
→ total borne
→ total cashbox
→ comptage final
```

Les écarts doivent être visibles par site, voie, agent, borne et période.

## 18. QR Mansa sur la borne

La borne doit pouvoir prendre en charge deux flux QR distincts.

### 18.1 QR affiché par la borne

La borne génère ou affiche un QR dynamique lié à une transaction précise.

Le QR doit référencer au minimum de manière sécurisée :

- transaction ;
- borne ;
- montant attendu ;
- devise ;
- expiration ;
- nonce ou référence anti-rejeu.

Le contenu sensible ne doit pas être exposé en clair lorsqu’un identifiant opaque suffit.

Flux :

```text
Borne crée transaction
→ QR dynamique affiché
→ client scanne avec Mansa
→ app charge les détails depuis le backend
→ client confirme
→ paiement validé
→ borne reçoit confirmation
→ service/barrière autorisé
```

### 18.2 QR client scanné par la borne

La borne peut également intégrer un scanner 2D afin de lire un QR Mansa présenté par le client.

Ce QR peut représenter :

- identité de compte temporaire ;
- token de paiement ;
- pass ;
- ticket ;
- abonnement ;
- autorisation spécifique.

Le QR présenté par le client doit être à durée limitée ou protégé contre la réutilisation lorsque le cas d’usage l’exige.

## 19. Scanner QR

Le scanner QR est un périphérique distinct du lecteur RFID et du terminal carte.

Il doit idéalement supporter :

- QR Code ;
- codes 1D utiles si nécessaire ;
- lecture écran smartphone ;
- lecture papier ;
- faible luminosité ;
- validation d’intégrité du contenu ;
- remontée d’état santé.

Le logiciel ne doit pas supposer qu’une borne possède un scanner simplement parce qu’elle possède une caméra.

## 20. RFID n’est pas un choix de paiement à afficher

Pour le télépéage initial, RFID est un mécanisme automatique d’identification/autorisation du véhicule.

Le parcours recommandé est :

```text
Véhicule arrive
→ RFID détecté automatiquement
→ plaque ANPR vérifiée selon politique
→ abonnement/wallet contrôlé
→ ALLOW ou DENY
```

L’écran ne doit donc pas demander à un abonné de « choisir RFID ».

Si aucun abonnement valide n’est détecté, la borne peut ensuite afficher les moyens de paiement disponibles, par exemple :

- carte bancaire ;
- carte Mansa ;
- wallet/QR Mansa ;
- Mobile Money si activé ;
- billets FCFA ;
- pièces FCFA.

## 21. Paiement carte et NFC

Le terminal carte doit être traité comme un périphérique sécurisé séparé.

Il doit accepter uniquement les réseaux activés par l’acquéreur et le contrat du site, notamment Visa et Mastercard lorsqu’ils sont effectivement disponibles.

Il peut prendre en charge :

- puce EMV ;
- sans contact ;
- PIN ;
- carte Mansa si le programme carte et l’acquéreur le permettent ;
- autres réseaux contractuellement activés.

Aucune interface ne doit promettre « toutes les cartes ».

## 22. Mobile Money

Mobile Money reste activable/désactivable par l’administration au niveau :

- national ;
- réseau ;
- poste ;
- voie ;
- opérateur ;
- période d’effet.

Une panne temporaire doit produire `TEMPORARILY_UNAVAILABLE`, pas supprimer le canal de configuration.

## 23. Écran de borne

L’écran doit être piloté par les capacités réellement disponibles de la borne.

Exemple véhicule non abonné :

```text
Montant à payer : 2 000 FCFA

Choisissez votre moyen de paiement :
[Carte]
[QR Mansa]
[Mobile Money]
[Espèces]
```

Les options indisponibles peuvent être masquées ou affichées désactivées selon la politique UX.

## 24. Messages espèces

Messages recommandés :

```text
Insérez vos billets ou pièces.
Montant reçu : 1 000 FCFA
Reste à payer : 1 000 FCFA
Montant atteint.
Monnaie rendue : 3 000 FCFA
Billet non accepté — veuillez le reprendre.
Cette coupure est temporairement indisponible.
Montant exact requis.
Accepteur de billets indisponible — choisissez un autre moyen.
```

Une panne de validateur ne doit jamais être présentée comme un refus de paiement du client.

## 25. Santé des périphériques

Chaque périphérique doit exposer autant que possible :

- `ONLINE/OFFLINE` ;
- prêt/non prêt ;
- capot ouvert ;
- bourrage ;
- cashbox pleine ;
- stock faible ;
- température ou diagnostic si fourni ;
- firmware ;
- version de configuration ;
- dernier événement ;
- dernière communication.

## 26. Mode dégradé

Si le validateur de billets tombe en panne mais que carte et QR fonctionnent :

- la borne reste active ;
- `CASH_BILLS` passe indisponible ;
- l’écran propose les autres moyens.

Si le monnayeur tombe en panne :

- les pièces peuvent être désactivées ;
- les billets peuvent rester actifs uniquement si la politique de rendu le permet.

Si tous les moyens de paiement sont indisponibles, la voie peut être fermée ou basculée vers une procédure d’assistance.

## 27. Fonctionnement hors ligne

Les espèces sont naturellement encaissables localement, mais Mansa doit conserver un journal local sécurisé avec :

- séquence monotone ;
- identifiant transaction ;
- montant par coupure/pièce ;
- monnaie rendue ;
- total local ;
- événements périphériques ;
- passage/service associé.

À la reconnexion :

- synchronisation idempotente ;
- aucune duplication ;
- rapprochement automatique ;
- signalement des écarts.

Pour QR, carte et Mobile Money, les limites hors ligne dépendent du canal et des règles du fournisseur/acquéreur. Mansa ne doit jamais inventer une autorisation offline non supportée contractuellement.

## 28. Sécurité physique

Les bornes doivent pouvoir intégrer :

- serrure sécurisée ;
- capteur d’ouverture ;
- alarme sabotage ;
- journal d’accès maintenance ;
- séparation coffre/électronique ;
- fixations anti-arrachement ;
- vidéosurveillance externe lorsque autorisée ;
- scellés ou procédures de collecte.

## 29. Permissions administratives

Les permissions minimales doivent distinguer :

```text
VIEW_DEVICE_STATUS
CONFIGURE_DENOMINATIONS
ENABLE_DISABLE_CASH
OPEN_MAINTENANCE_SESSION
REMOVE_CASHBOX
CONFIRM_CASH_COUNT
APPROVE_DISCREPANCY
UPDATE_DEVICE_FIRMWARE
CONFIGURE_QR_SCANNER
```

Les actions sensibles nécessitent un audit complet.

## 30. Modèle de données recommandé

Entités conceptuelles :

```text
CashDevice
BillValidator
CoinValidator
CashBox
CashInventory
CashTransaction
CashInsertionEvent
CashDispenseEvent
CashCollectionSession
CashCount
CashDiscrepancy
DeviceCapability
DeviceHealthEvent
CurrencyProfile
DenominationProfile
QrScanner
QrPaymentSession
PeripheralConfiguration
```

Chaque entité doit être isolée par organisation/site lorsque nécessaire.

## 31. API conceptuelle

Exemples :

```text
POST /cash/transactions
POST /cash/transactions/:id/events
POST /cash/transactions/:id/cancel
GET  /cash/devices/:id/status
POST /cash/devices/:id/enable
POST /cash/devices/:id/disable
GET  /cash/devices/:id/inventory
POST /cash/collections
POST /cash/collections/:id/count
POST /qr/payment-sessions
POST /qr/scan
GET  /peripherals/:id/health
```

Les commandes matérielles critiques doivent être idempotentes lorsque pertinent.

## 32. Tests obligatoires

Avant mise en production FCFA :

- tester chaque coupure autorisée ;
- tester chaque pièce autorisée ;
- tester billets usés mais valides ;
- tester orientations différentes ;
- tester billets non XOF ;
- tester objets/pièces étrangères ;
- tester faux ou échantillons de test autorisés via procédures fabricant ;
- tester bourrage ;
- tester cashbox pleine ;
- tester rendu de monnaie insuffisant ;
- tester coupure réseau ;
- tester redémarrage pendant transaction ;
- tester annulation ;
- tester double événement ;
- tester QR expiré ;
- tester QR déjà utilisé ;
- tester scanner indisponible ;
- tester réconciliation fin de journée.

Les tests de faux billets doivent être conduits dans un cadre légal et avec jeux de test/procédures fournis ou autorisés par les acteurs compétents.

## 33. Qualification fournisseur

Avant achat d’une borne ou d’un validateur, le fournisseur doit confirmer par écrit :

- support de la devise `XOF` ;
- coupures/pièces supportées ;
- version de dataset/profil monétaire ;
- taux de reconnaissance annoncé ;
- comportement sur billet suspect ;
- capacité de mise à jour ;
- interfaces disponibles ;
- disponibilité des pièces détachées ;
- documentation d’intégration ;
- durée de support ;
- environnement température/poussière/humidité ;
- alimentation et protections électriques ;
- disponibilité locale ou délais de remplacement.

Une simple mention « bill acceptor » ou « coin acceptor » ne suffit pas à valider la compatibilité Mali/FCFA.

## 34. Trois niveaux d’équipement

Le sous-système doit fonctionner avec les trois modèles déjà retenus pour les péages :

### Voie automatique complète

Peut inclure :

- validateur billets ;
- validateur pièces ;
- recycleurs ;
- terminal EMV/NFC ;
- QR scanner ;
- QR affiché à l’écran ;
- RFID ;
- ANPR ;
- imprimante ;
- contrôleur local.

### Voie semi-automatique

Peut utiliser :

- agent ;
- caisse sécurisée ;
- terminal numérique ;
- scanner QR ;
- carte/NFC ;
- espèces saisies et rapprochées ;
- audit des ouvertures.

### Poste numérisé à faible coût

Peut commencer avec :

- terminal Android/TPE ;
- QR ;
- carte ;
- Mobile Money selon activation ;
- caisse physique sécurisée ;
- imprimante optionnelle.

L’État ou concessionnaire n’est pas obligé d’automatiser toutes les voies immédiatement.

## 35. Modèles commerciaux du matériel

Le logiciel doit être neutre entre :

1. matériel acheté directement par l’État/concessionnaire ;
2. matériel fourni, intégré ou revendu par Mansa.

Dans les deux cas, les périphériques passent par les mêmes contrats d’adaptation et de conformité.

## 36. Marque blanche

La borne peut afficher la marque de l’État, agence ou concessionnaire sur :

- écran ;
- boîtier ;
- reçu ;
- QR ;
- ticket ;
- signalétique.

La mention `Propulsé par Mansa` reste facultative.

## 37. Indicateurs de pilotage

Le portail doit suivre :

- volume espèces par borne ;
- volume par coupure ;
- taux de rejet ;
- taux de panne ;
- bourrages ;
- cashboxes proches de saturation ;
- besoins de rendu de monnaie ;
- écarts de comptage ;
- utilisation QR ;
- moyens de paiement disponibles/indisponibles ;
- durée moyenne d’une transaction ;
- incidents de collecte.

## 38. Critères d’acceptation

Le module est considéré prêt lorsque :

1. un périphérique de test peut être branché via un adaptateur sans changer le domaine métier ;
2. les profils XOF sont configurables ;
3. les événements de billets/pièces sont normalisés ;
4. un billet refusé n’augmente jamais le montant payé ;
5. le rendu de monnaie est vérifié avant finalisation ;
6. le QR dynamique de borne est anti-rejeu ;
7. le scanner QR client est traité comme périphérique indépendant ;
8. RFID reste un flux automatique et non un faux bouton de paiement ;
9. les pannes partielles désactivent uniquement les capacités touchées lorsque cela est sûr ;
10. les espèces encaissées restent réconciliables jusqu’au comptage final ;
11. les opérations hors ligne se resynchronisent sans double comptabilisation ;
12. toute ouverture de coffre et tout écart sont audités.

## 39. Résultat attendu

Mansa doit pouvoir équiper progressivement une borne ou un péage avec des périphériques réellement adaptés au contexte local, sans dépendre d’un modèle propriétaire unique.

Le principe fondamental est :

**le matériel spécialisé reconnaît et sécurise le média physique ; Mansa orchestre la transaction, les règles, l’audit, le rapprochement, le paiement et le service rendu.**
