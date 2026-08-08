# Domaine État — Exploitation espèces, rapprochement et anti-corruption des péages

## 1. Objet

Ce document définit le cahier des charges Mansa pour la gestion opérationnelle des espèces dans les péages publics ou concédés : billets et pièces FCFA/XOF, rendu de monnaie, fonds de caisse, cassettes et recycleurs, collecte, comptage, transport de fonds, rapprochement comptable, écarts, incidents et audit.

Il complète les documents de péage, télépéage, matériel et paiement existants sans les remplacer.

## 2. Principes de référence du domaine péage

Mansa doit conserver simultanément les architectures suivantes :

- solution A : péage automatique classique avec barrière ;
- solution B : télépéage RFID UHF avec barrière ;
- évolution future optionnelle : free-flow sans barrière, sans supprimer ni remplacer les deux solutions initiales.

Le péage classique peut accepter, selon les canaux activés :

- billets FCFA/XOF ;
- pièces FCFA/XOF ;
- carte bancaire EMV ;
- réseaux carte activés par l’acquéreur, notamment Visa et Mastercard lorsqu’ils sont contractuellement disponibles ;
- NFC ;
- carte Mansa ;
- wallet Mansa ;
- QR ;
- Mobile Money.

Mobile Money reste un canal configurable. Il peut être activé ou désactivé par l’administration au niveau national, réseau, poste ou voie, avec date d’effet, auteur, motif et audit. Il ne doit jamais être supprimé automatiquement du produit.

## 3. Trois niveaux d’équipement

Mansa doit gérer au minimum trois profils opérationnels :

### 3.1 Voie automatique complète

Borne automatique avec barrière, paiement électronique et espèces automatisées selon configuration : validateur de billets, monnayeur, recycleur, rendu de monnaie, imprimante, QR, TPE EMV/NFC, contrôleur local et capteurs.

### 3.2 Voie semi-automatique

Un agent encaisse ou assiste le paiement depuis un poste sécurisé. Les espèces sont gérées dans un tiroir, coffre, cassette ou module comptable associé à la session de l’agent. Toute ouverture manuelle de barrière reste auditée.

### 3.3 Poste numérisé à faible coût

Poste existant conservé avec numérisation progressive : application Mansa, terminal ou tablette, imprimante facultative, perception manuelle des espèces et rapprochement numérique. L’État n’est pas obligé de remplacer tout le matériel immédiatement.

## 4. Compatibilité matérielle

Mansa ne dépend d’aucun fabricant unique.

Les bornes, validateurs, recycleurs, monnayeurs, coffres intelligents, imprimantes, barrières et contrôleurs sont intégrés derrière des adaptateurs.

Interfaces possibles selon l’équipement :

```text
REST / HTTP
SDK constructeur
TCP/IP
USB
RS-232
RS-485
MDB
Pulse
GPIO
relais / contact sec
interface industrielle documentée
```

Le matériel acheté directement par l’État ou le concessionnaire doit pouvoir être intégré lorsqu’une interface exploitable existe.

Mansa peut également fournir, intégrer ou revendre du matériel. Les deux modèles commerciaux doivent être supportés.

## 5. Devise et validation XOF

Toute fonctionnalité espèces au Mali doit être explicitement compatible XOF/BCEAO.

Le fournisseur du module espèces doit confirmer et faire valider en recette :

- les coupures de billets supportées ;
- les pièces supportées ;
- les règles de rejet ;
- le dataset ou firmware monétaire XOF ;
- la reconnaissance des coupures ;
- le rendu de monnaie XOF ;
- la capacité des cassettes, recycleurs et hoppers ;
- la procédure de mise à jour en cas de changement de série monétaire.

Mansa ne doit jamais prétendre qu’un validateur euro ou dollar accepte automatiquement le FCFA.

## 6. Modèle de données minimal

Entités recommandées :

```text
TollSite
TollPlaza
TollLane
TollShift
CashSession
CashDevice
CashCassette
CashRecycler
CashHopper
CashFloat
CashMovement
CashCollection
CashCount
CashReconciliation
CashDiscrepancy
CashDeposit
CashTransportHandover
BarrierOpeningEvent
VehiclePassageEvent
TollTransaction
AuditLog
```

Chaque enregistrement doit être multi-tenant et rattaché à l’organisation compétente : État, agence, concessionnaire ou exploitant.

## 7. Fonds de caisse

Pour une voie semi-automatique ou un poste numérisé, un fonds de caisse initial peut être attribué à une session.

Champs minimaux :

- montant initial ;
- détail par coupure si suivi physique ;
- devise ;
- agent responsable ;
- poste/voie ;
- heure de remise ;
- remettant ;
- receveur ;
- statut ;
- signature ou confirmation numérique ;
- pièces justificatives facultatives selon politique.

Aucun agent ne doit pouvoir modifier rétroactivement son fonds initial sans correction auditée.

## 8. Sessions de caisse

Chaque prise de poste ouvre une `CashSession`.

États possibles :

```text
OPEN
LOCKED
COUNTING
RECONCILING
CLOSED
DISPUTED
```

Une session enregistre :

- agent ;
- voie ou poste ;
- heure d’ouverture ;
- fonds initial ;
- transactions espèces ;
- remboursements autorisés ;
- annulations ;
- ouvertures manuelles de barrière ;
- mouvements de caisse ;
- montant théorique de clôture ;
- montant compté ;
- écart ;
- validations hiérarchiques.

## 9. Borne automatique : cassettes et recycleurs

Pour les voies automatiques, Mansa doit suivre séparément :

- cassette d’acceptation ;
- recycleur billets ;
- hopper pièces ;
- bac de rejet ;
- coffre de collecte ;
- niveau estimé ou remonté par le périphérique ;
- capacité maximale ;
- seuil de remplissage ;
- seuil minimum de monnaie disponible.

Les identifiants physiques des cassettes doivent pouvoir être scannés ou saisis lors de la pose et du retrait.

## 10. Rendu de monnaie

Le moteur espèces doit supporter :

```text
EXACT_CHANGE_REQUIRED
COINS_ONLY_CHANGE
NOTES_ONLY_CHANGE
MIXED_CHANGE
NO_CASH_IF_CHANGE_UNAVAILABLE
MANUAL_ASSISTANCE_REQUIRED
```

Avant d’accepter un billet ou une combinaison de billets/pièces, la borne peut vérifier si le rendu est possible selon la politique configurée.

Si le rendu devient impossible :

- le cash peut être temporairement désactivé ;
- le paiement exact peut être imposé ;
- une assistance peut être demandée ;
- les autres moyens de paiement continuent à fonctionner lorsque disponibles.

L’usager doit recevoir un message clair avant d’insérer les espèces.

## 11. Mouvements d’espèces

Tout mouvement significatif doit produire un événement immuable :

```text
FLOAT_IN
FLOAT_OUT
CASH_ACCEPTED
CHANGE_DISPENSED
REFUND
MANUAL_ADJUSTMENT
CASSETTE_INSERTED
CASSETTE_REMOVED
COLLECTION_STARTED
COLLECTION_COMPLETED
COUNT_CONFIRMED
BANK_DEPOSIT_CONFIRMED
```

Les ajustements manuels exigent au minimum : motif, auteur, date, montant et approbation selon seuil.

## 12. Collecte des cassettes

La collecte doit utiliser un workflow contrôlé :

1. demande ou alerte de collecte ;
2. identification de la borne et cassette ;
3. passage de la borne en état approprié ;
4. authentification des agents autorisés ;
5. retrait de la cassette ;
6. scellement ou confirmation du sceau si utilisé ;
7. scan de l’identifiant cassette ;
8. transfert de responsabilité ;
9. installation d’une cassette vide ou préparée ;
10. remise en service ;
11. journalisation complète.

Mansa ne doit pas exiger qu’une seule personne puisse à la fois retirer, compter et valider lorsque la politique de séparation des tâches est activée.

## 13. Séparation des tâches

Pour les sites sensibles, le système doit permettre des politiques de double contrôle :

- agent de voie ;
- superviseur ;
- agent de collecte ;
- agent de comptage ;
- responsable financier ;
- auditeur.

Exemple : la personne qui retire une cassette ne valide pas seule le comptage final.

Les rôles et seuils restent configurables par organisation.

## 14. Comptage physique

Le comptage peut être :

- automatique via coffre ou compteur connecté ;
- semi-automatique avec saisie par coupure ;
- manuel avec double validation.

Le détail recommandé est :

```text
10000 XOF × quantité
5000 XOF × quantité
2000 XOF × quantité
1000 XOF × quantité
500 XOF × quantité
pièces XOF × quantité
```

La liste réelle des coupures supportées doit être configurable et alignée sur le matériel et la politique monétaire en vigueur.

## 15. Rapprochement automatique

Pour chaque session, cassette, voie et période :

```text
montant théorique
= fonds initial
+ espèces encaissées
- monnaie rendue
- remboursements autorisés
- retraits/collectes enregistrés
+ apports de fonds documentés
```

Puis :

```text
écart = montant physique compté - montant théorique
```

Le système classe automatiquement :

```text
MATCHED
OVERAGE
SHORTAGE
PENDING_COUNT
PENDING_REVIEW
RESOLVED
```

## 16. Tolérances et seuils

L’administration peut définir des seuils :

- tolérance absolue ;
- tolérance relative ;
- seuil nécessitant justification ;
- seuil nécessitant validation superviseur ;
- seuil déclenchant enquête/audit.

Les tolérances ne doivent jamais masquer l’écart brut : le montant réel reste conservé.

## 17. Anti-corruption et rapprochement véhicule-paiement

Mansa doit rapprocher autant que possible :

```text
véhicule détecté
→ catégorie véhicule
→ tarif attendu
→ transaction attendue
→ paiement effectivement reçu
→ autorisation d’ouverture
→ ouverture réelle de barrière
→ passage physique détecté
```

Les sources possibles sont RFID UHF, ANPR, boucle inductive, radar, lidar ou autre capteur compatible.

Anomalies à détecter :

- passage sans paiement ni abonnement valide ;
- paiement inférieur au tarif attendu ;
- catégorie modifiée fréquemment par le même agent ;
- annulation après passage ;
- barrière ouverte manuellement sans motif ;
- trop grand nombre d’ouvertures manuelles ;
- transaction créée sans passage ;
- passage détecté sans transaction associée ;
- écarts de caisse récurrents ;
- collecte ou comptage incomplet ;
- cassette retirée hors procédure.

## 18. Ouvertures manuelles de barrière

Toute ouverture manuelle doit enregistrer :

- voie ;
- date/heure ;
- agent ;
- rôle ;
- motif ;
- véhicule/plaque si disponible ;
- catégorie ;
- transaction associée ou absence de transaction ;
- validation superviseur si politique applicable ;
- image ou événement ANPR si disponible ;
- passage physique après ouverture.

Aucune fonction d’ouverture manuelle ne doit effacer ou contourner le journal d’audit.

## 19. Télépéage RFID

Le télépéage initial utilise :

- tag UHF RFID passif ;
- véhicule associé ;
- compte ou abonnement associé ;
- lecteur/antenne ;
- contrôleur local ;
- relais `OPEN` ;
- barrière ;
- capteurs de passage.

Le télépéage reste distinct de l’encaissement espèces, mais tous les passages doivent alimenter le même rapprochement opérationnel de voie.

## 20. Fonctionnement hors ligne

Le péage doit conserver un mode local/hors ligne sécurisé.

Le contrôleur peut mettre en cache :

- tarifs applicables ;
- règles minimales ;
- listes d’autorisation/blocage ;
- capacité à enregistrer localement les transactions ;
- compteurs d’événements ;
- journal signé ou protégé contre altération.

Au retour du réseau :

- resynchronisation ;
- idempotence ;
- absence de double débit ;
- conservation de l’ordre des événements ;
- rapprochement automatique ;
- signalement des divergences.

## 21. Mobile Money

Mobile Money doit être contrôlé par politique administrative et non par suppression de code.

Niveaux de configuration :

```text
NATIONAL
NETWORK
TOLL_PLAZA
LANE
```

Chaque changement doit enregistrer :

- ancienne valeur ;
- nouvelle valeur ;
- auteur ;
- motif ;
- date de décision ;
- date d’effet ;
- éventuelle date de fin ;
- audit.

## 22. Carte bancaire et NFC

Le terminal de paiement doit accepter uniquement les réseaux réellement activés par l’acquéreur.

Mansa peut afficher Visa et Mastercard lorsqu’ils sont contractuellement disponibles, mais ne doit jamais promettre « toutes les cartes du monde ».

Le terminal doit suivre les exigences EMV applicables et séparer les données sensibles carte du cœur applicatif Mansa selon l’architecture du prestataire de paiement.

## 23. Dépôt bancaire et transport de fonds

Un lot de collecte peut passer par :

```text
COLLECTED
IN_TRANSIT
RECEIVED_AT_COUNTING_CENTER
COUNTED
RECONCILED
DEPOSITED
BANK_CONFIRMED
DISPUTED
```

Le transfert de responsabilité doit pouvoir enregistrer :

- personne ou société remettante ;
- personne ou société receveuse ;
- identifiants sacs/cassettes/scellés ;
- heure ;
- site ;
- montant attendu ;
- montant compté ;
- preuves de remise ;
- anomalies.

## 24. Tableau de bord opérationnel

Indicateurs recommandés :

- encaissement espèces par site/voie ;
- part espèces vs électronique ;
- montant de monnaie disponible ;
- cassettes proches du plein ;
- hoppers proches du vide ;
- écarts de caisse ;
- ouvertures manuelles ;
- taux de rapprochement véhicule-paiement-passage ;
- collecte en retard ;
- dépôts non confirmés ;
- anomalies par agent/site ;
- disponibilité des moyens de paiement.

## 25. Alertes

Alertes configurables :

```text
LOW_CHANGE
CASHBOX_NEAR_FULL
CASSETTE_REMOVED_UNEXPECTEDLY
COUNT_MISMATCH
REPEATED_SHORTAGE
UNPAID_PASSAGE
MANUAL_GATE_OPENING
COLLECTION_OVERDUE
BANK_DEPOSIT_MISSING
CASH_DEVICE_OFFLINE
```

Les alertes doivent être dédupliquées et avoir des niveaux de sévérité.

## 26. Marque blanche

Les bornes, écrans, tags, reçus et signalétique doivent pouvoir être personnalisés aux couleurs de l’État, d’une agence ou d’un concessionnaire.

La mention `Propulsé par Mansa` est facultative et configurable.

La personnalisation ne doit jamais modifier les règles d’audit, de sécurité ou de rapprochement.

## 27. Déploiement progressif

L’État doit pouvoir déployer Mansa progressivement :

1. numériser quelques postes existants ;
2. ajouter des voies semi-automatiques ;
3. installer des voies automatiques complètes ;
4. introduire le RFID UHF ;
5. étendre réseau par réseau ;
6. envisager ultérieurement le free-flow là où pertinent.

Aucune étape ne doit imposer l’équipement simultané de tous les péages.

## 28. Administration

Menus recommandés :

```text
État > Péages > Espèces
├── Sessions de caisse
├── Fonds de caisse
├── Cassettes
├── Recycleurs
├── Hoppers
├── Collectes
├── Comptages
├── Rapprochements
├── Écarts
├── Dépôts bancaires
├── Transport de fonds
├── Ouvertures manuelles
├── Alertes
└── Audit
```

Chaque action sensible est soumise au RBAC et au journal d’audit.

## 29. API et événements

Événements recommandés :

```text
cash.session.opened
cash.float.assigned
cash.accepted
cash.change.dispensed
cash.cassette.inserted
cash.cassette.removed
cash.collection.started
cash.collection.completed
cash.count.completed
cash.reconciliation.completed
cash.discrepancy.detected
cash.deposit.confirmed
barrier.manual_opened
vehicle.passage.detected
```

Les consommateurs doivent pouvoir traiter ces événements de manière idempotente.

## 30. Critères de recette

Un déploiement n’est pas accepté tant que les scénarios suivants ne sont pas testés :

- paiement espèces exact ;
- paiement avec rendu de monnaie ;
- manque de monnaie ;
- cassette presque pleine ;
- retrait/pose cassette ;
- clôture de session ;
- comptage et rapprochement ;
- écart volontaire détecté ;
- ouverture manuelle auditée ;
- passage sans transaction détecté ;
- perte réseau et resynchronisation sans double débit ;
- désactivation Mobile Money à un niveau donné puis réactivation avec audit ;
- paiement carte sur un réseau réellement activé ;
- exploitation de matériel de plusieurs fournisseurs via adaptateurs.

## 31. Sécurité et conservation

Les journaux financiers et d’ouverture de barrière doivent être protégés contre la modification non autorisée.

Les données de caisse, d’agent, de plaque et de passage doivent être accessibles uniquement aux rôles autorisés et conservées selon les politiques légales et opérationnelles applicables.

Aucun secret fournisseur, mot de passe, clé API, clé terminal ou donnée sensible de carte ne doit être stocké dans Git.
