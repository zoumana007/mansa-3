# Cahier des charges — Dépôts d’espèces, cash-in et automates de dépôt

## 1. Objet

Ce document définit les exigences Mansa relatives aux dépôts d’espèces sur compte ou wallet, aux automates de dépôt, aux dépôts assistés par agent, aux coffres intelligents et aux mécanismes de transformation du cash physique en solde numérique.

Il complète le domaine ATM déjà documenté, qui prévoit le cash-in comme évolution future, sans remplacer les fonctions de retrait existantes.

L’objectif est de permettre au Mali puis dans d’autres pays un dépôt d’espèces sûr, traçable, multi-fournisseurs, compatible XOF, intégrable aux banques partenaires et exploitable par Mansa, un établissement partenaire, une entreprise, un commerçant, un agent ou une administration selon le modèle déployé.

## 2. Principes directeurs

Mansa doit respecter les principes suivants :

1. aucun solde client ne doit être crédité définitivement sur la seule base d’une déclaration utilisateur ;
2. le crédit final doit être lié à un résultat physique confirmé ou à une procédure de contrôle explicitement autorisée ;
3. tout dépôt doit être idempotent, rapprochable et auditable ;
4. les billets et pièces doivent être validés pour la devise réellement utilisée, notamment XOF au Mali ;
5. le matériel doit être abstrait derrière des adaptateurs multi-fournisseurs ;
6. les billets rejetés, suspects, retenus ou non reconnus doivent être distingués ;
7. les dépôts partiels doivent être explicitement gérés ;
8. le cash physique doit être suivi comme une ressource comptable distincte du solde numérique ;
9. aucun secret, PIN ou donnée sensible non nécessaire ne doit être journalisé ;
10. les plafonds, frais, commissions, canaux et profils autorisés doivent être configurables côté serveur ;
11. le système doit empêcher les doubles crédits lors d’une reprise réseau, d’un retry ou d’un redémarrage appareil ;
12. toute correction manuelle doit être motivée, auditée et soumise à approbation selon les seuils ;
13. les automates doivent pouvoir être désactivés ou mis en quarantaine à distance ;
14. la séparation des tâches doit être disponible pour comptage, collecte, correction et validation ;
15. le dépôt d’espèces doit alimenter les contrôles fraude, conformité et limites existants.

## 3. Périmètre fonctionnel

Le domaine couvre au minimum :

```text
ATM_CASH_IN
CASH_DEPOSIT_MACHINE
SMART_SAFE_DEPOSIT
AGENT_CASH_IN
MERCHANT_CASH_DEPOSIT
WALLET_CASH_IN
ACCOUNT_CASH_DEPOSIT
CARDLESS_CASH_DEPOSIT
QR_CASH_DEPOSIT
REFERENCE_BASED_DEPOSIT
BULK_CASH_DEPOSIT
CASH_COUNTING
CASH_VALIDATION
CASH_REJECTION
SUSPECT_NOTE_HANDLING
CASH_ESCROW
CASH_ACCEPTANCE_COMMIT
CASH_RETURN
CASH_COLLECTION
CASH_CASSETTE_MANAGEMENT
CASH_RECONCILIATION
CASH_DISCREPANCY
CASH_DEPOSIT_REVERSAL
CASH_DEPOSIT_DISPUTE
CASH_DEPOSIT_FEE_POLICY
CASH_DEPOSIT_LIMIT_POLICY
CASH_DEPOSIT_MONITORING
CASH_DEPOSIT_OFFLINE_RECOVERY
```

## 4. Canaux de dépôt

### 4.1 Automate de dépôt

Parcours recommandé :

```text
identification client ou bénéficiaire
-> création d’une session de dépôt
-> ouverture du module d’acceptation
-> insertion des espèces
-> validation et comptage physique
-> affichage du montant reconnu
-> confirmation selon politique
-> engagement physique du cash
-> crédit financier
-> reçu et notification
```

### 4.2 Dépôt assisté par agent

Un agent Mansa ou partenaire peut accepter un dépôt si le canal est activé.

Le système doit enregistrer :

- agent ;
- point de service ;
- client ou bénéficiaire ;
- montant déclaré ;
- montant compté ;
- devise ;
- moyen de preuve ;
- frais éventuels ;
- commission ;
- statut de validation ;
- événements d’audit.

### 4.3 Coffre intelligent commerçant

Un commerçant ou une entreprise peut déposer ses recettes dans un coffre intelligent relié à Mansa.

Le crédit peut être :

```text
IMMEDIATE_CONFIRMED
PROVISIONAL_PENDING_RECONCILIATION
AFTER_COLLECTION
AFTER_BANK_COUNT
```

Le mode doit être explicite et configurable contractuellement.

### 4.4 Dépôt sans carte

Mansa peut permettre :

- QR dynamique ;
- numéro de téléphone ;
- identifiant wallet ;
- référence de dépôt ;
- code à usage unique ;
- bénéficiaire sélectionné dans l’application.

Une référence ne doit pas permettre de détourner le dépôt vers un autre bénéficiaire après insertion des espèces.

## 5. Entités recommandées

```text
CashDepositDevice
CashDepositSite
CashDepositOperator
CashDepositSession
CashDepositOrder
CashDepositAttempt
CashAcceptanceBatch
CashAcceptedItem
CashRejectedItem
CashSuspectItem
CashEscrow
CashDepositCommit
CashDepositCredit
CashDepositReversal
CashDepositReceipt
CashDepositFeePolicy
CashDepositLimitPolicy
CashDepositRoutingPolicy
CashDepositCassette
CashDepositBag
CashDepositCollection
CashDepositCount
CashDepositReconciliation
CashDepositDiscrepancy
CashDepositDispute
CashDepositIncident
CashDepositHealthEvent
CashDepositMaintenanceSession
AuditLog
```

Chaque entité doit inclure organisation, pays, devise, site, appareil et tenant lorsque pertinent.

## 6. États d’un dépôt

États recommandés :

```text
CREATED
IDENTIFYING
READY_FOR_CASH
ACCEPTING
COUNTING
AMOUNT_PRESENTED
AWAITING_CONFIRMATION
COMMITTING_CASH
CASH_COMMITTED
CREDIT_PENDING
CREDITED
PARTIALLY_ACCEPTED
REJECTED
CASH_RETURNED
REVERSAL_PENDING
REVERSED
RECONCILIATION_PENDING
COMPLETED
DISPUTED
CANCELLED
FAILED
UNKNOWN
```

Les transitions doivent être contrôlées par machine d’état.

## 7. Principe de crédit conditionné au cash réel

Le flux recommandé est :

```text
1. création de l’intention de dépôt
2. comptage et validation physique
3. montant reconnu présenté au client
4. confirmation de l’engagement physique des espèces
5. création du crédit ledger
6. confirmation finale
```

Le système ne doit pas créditer définitivement le client avant de savoir si les espèces sont réellement sous contrôle de l’automate ou de l’opérateur autorisé.

## 8. Escrow physique

Lorsque le matériel le permet, les billets peuvent rester temporairement dans un compartiment d’escrow avant engagement final.

Si le client annule avant commit :

```text
ESCROW_HELD
-> CANCELLED
-> CASH_RETURN_REQUESTED
-> CASH_RETURNED
```

Si le retour échoue, le dépôt devient un incident à traiter et ne doit pas être silencieusement considéré comme annulé.

## 9. Dépôts partiels

Le dispositif peut accepter certaines coupures et en rejeter d’autres.

Exemple :

```text
inséré : 50 000 XOF
accepté : 45 000 XOF
rejeté : 5 000 XOF
```

Le montant crédité doit correspondre au montant effectivement accepté et engagé.

L’écran ou l’agent doit présenter clairement le résultat avant finalisation lorsque le parcours le permet.

## 10. Validation XOF

Tout matériel déployé au Mali doit être explicitement validé pour XOF/BCEAO.

Le fournisseur doit confirmer :

- séries de billets reconnues ;
- coupures supportées ;
- pièces supportées si applicable ;
- taux de reconnaissance attendu ;
- mécanismes anti-contrefaçon ;
- règles de rejet ;
- firmware ou dataset monétaire ;
- procédure de mise à jour ;
- capacité des cassettes et sacs.

Mansa ne doit jamais supposer qu’un validateur EUR ou USD accepte automatiquement le FCFA.

## 11. Billets suspects

Le système doit distinguer :

```text
ACCEPTED
REJECTED_UNREADABLE
REJECTED_UNSUPPORTED
SUSPECT_COUNTERFEIT
SUSPECT_DAMAGED
RETAINED_FOR_REVIEW
UNKNOWN
```

Les règles de rétention dépendent du matériel, du partenaire et du cadre réglementaire applicable.

Aucune interface ne doit accuser automatiquement un client de contrefaçon sur la seule base d’un signal matériel non confirmé.

## 12. Comptage et détail par coupure

Lorsque disponible, le système enregistre :

```text
10000 XOF × quantité
5000 XOF × quantité
2000 XOF × quantité
1000 XOF × quantité
500 XOF × quantité
pièces XOF × quantité
```

La liste réelle doit rester configurable.

## 13. Inventaire physique

Mansa doit maintenir :

```text
cashAcceptedConfirmed
- cashReturned
- cashCollected
- cashRetainedForReview
+ approvedCorrections
= expectedPhysicalCash
```

Le comptage physique lors de la collecte reste la référence de rapprochement.

## 14. Cassettes, sacs et coffres

Chaque unité physique doit avoir un identifiant unique.

Champs recommandés :

```text
containerId
serialNumber
containerType
siteId
deviceId
currency
expectedAmount
countedAmount
sealNumber
status
installedAt
removedAt
custodyHolder
```

États possibles :

```text
EMPTY
PREPARED
INSTALLED
IN_USE
FULL
SEALED
IN_TRANSIT
COUNTING
RECONCILED
DISPUTED
```

## 15. Seuils de capacité

Le système doit surveiller :

- remplissage par cassette ;
- remplissage global ;
- seuil d’alerte ;
- seuil critique ;
- capacité restante estimée ;
- taux de rejet ;
- anomalies capteurs.

Un automate plein doit refuser un nouveau dépôt avant insertion si le matériel ne peut plus sécuriser le cash.

## 16. Collecte de cash

Workflow recommandé :

1. création de mission ;
2. identification du site et de l’appareil ;
3. authentification des agents ;
4. mise en mode collecte ;
5. retrait contrôlé du contenant ;
6. scan identifiant et scellé ;
7. transfert de responsabilité ;
8. pose d’un contenant préparé ;
9. remise en service ;
10. transport ;
11. comptage ;
12. rapprochement ;
13. clôture.

## 17. Séparation des tâches

Le produit doit permettre :

```text
COLLECTOR != COUNTER
COUNTER != DISCREPANCY_APPROVER
TECHNICIAN != FINANCIAL_ADJUSTER
AGENT != OWN_HIGH_VALUE_DEPOSIT_APPROVER
```

Les rôles sont configurables par organisation.

## 18. Rapprochement

Pour chaque appareil, contenant, session et période :

```text
montant système attendu
vs
montant physique compté
vs
montant ledger crédité
vs
montant réglé au partenaire
```

États recommandés :

```text
MATCHED
SHORTAGE
OVERAGE
PENDING_COUNT
PENDING_REVIEW
RESOLVED
```

Tout écart brut doit être conservé même si une tolérance opérationnelle existe.

## 19. Reversal et correction

Un dépôt déjà crédité ne doit pas être supprimé du ledger.

Toute correction utilise une écriture compensatrice traçable.

Cas possibles :

- double crédit ;
- crédit sans cash confirmé ;
- montant physique différent ;
- incident automate ;
- correction partenaire ;
- décision issue d’un litige.

## 20. Idempotence

Chaque dépôt doit posséder un identifiant idempotent stable.

Un retry réseau, webhook dupliqué, redémarrage ou reprise d’un worker ne doit jamais provoquer un second crédit.

Les opérations suivantes doivent être idempotentes séparément :

```text
acceptanceCommit
ledgerCredit
partnerNotification
receiptGeneration
reconciliationPosting
```

## 21. Mode hors ligne et reprise

Le dépôt hors ligne est plus risqué que l’affichage ou la collecte d’événements.

Par défaut, un appareil sans capacité d’autorisation sécurisée doit empêcher le crédit définitif en absence de backend.

Un mode dégradé peut :

- conserver localement des événements signés ;
- maintenir le cash sous contrôle physique ;
- marquer le dépôt `CREDIT_PENDING` ;
- synchroniser au retour réseau ;
- empêcher tout double crédit ;
- signaler les divergences.

Le mode hors ligne ne doit jamais transformer un simple montant déclaré en crédit définitif.

## 22. Dépôt vers tiers

Le dépôt vers un autre bénéficiaire doit être soumis à politique.

Contrôles possibles :

- bénéficiaire vérifié ;
- limites renforcées ;
- motif ;
- restrictions KYC ;
- surveillance fraude ;
- preuve de relation si requise.

## 23. Limites

Les limites doivent être configurables :

```text
par transaction
par heure
par jour
par semaine
par mois
par client
par bénéficiaire
par appareil
par agent
par site
par pays
par niveau KYC
par type de compte
```

## 24. Frais

Les frais éventuels doivent être configurables par :

- canal ;
- appareil ;
- site ;
- segment ;
- montant ;
- abonnement ;
- partenaire ;
- pays.

Les frais doivent être affichés avant finalisation lorsque requis.

## 25. Commissions

Le moteur doit pouvoir répartir les revenus entre :

- Mansa ;
- banque partenaire ;
- propriétaire de l’automate ;
- opérateur du site ;
- agent ;
- prestataire de transport de fonds ;
- autre partenaire contractuel.

La logique doit réutiliser le moteur de tarification et commissions existant.

## 26. Contrôle fraude

Signaux recommandés :

- dépôts élevés juste sous les seuils ;
- fractionnement répété ;
- nombreux dépôts vers plusieurs bénéficiaires ;
- dépôts cash importants après récupération de compte ;
- appareil ou agent anormalement actif ;
- taux de rejet inhabituel ;
- écarts de caisse récurrents ;
- même billet ou événement matériel dupliqué ;
- dépôts suivis de retraits ou transferts immédiats ;
- géolocalisation incohérente ;
- bénéficiaire récemment créé ;
- dépôt vers compte bloqué ou restreint.

Les signaux alimentent le risk engine existant.

## 27. Conformité et traçabilité

Le domaine doit pouvoir appliquer :

- niveau KYC minimal ;
- limites réglementaires ;
- contrôles AML/CFT ;
- listes de surveillance lorsque applicables ;
- justification de provenance des fonds selon seuil ;
- déclaration ou revue manuelle selon politique ;
- conservation des preuves nécessaires.

Les règles ne doivent pas être codées en dur par pays.

## 28. Sécurité physique

Le matériel peut intégrer :

- coffre sécurisé ;
- détection d’ouverture ;
- détection d’arrachement ;
- capteurs de porte ;
- capteurs de cassette ;
- anti-fishing ;
- anti-tampering ;
- caméra externe selon politique ;
- UPS ;
- journal local protégé ;
- module cryptographique selon architecture.

## 29. Sécurité logicielle

Exigences minimales :

- authentification appareil ;
- certificats ou identités machine ;
- chiffrement en transit ;
- secrets hors Git ;
- moindre privilège ;
- commandes sensibles signées ou authentifiées ;
- journaux d’audit ;
- mises à jour vérifiées ;
- protection anti-replay ;
- rate limiting ;
- validation stricte des entrées.

## 30. Multi-fournisseurs

Le matériel doit être accessible derrière des adaptateurs.

Interface conceptuelle :

```text
CashDepositProvider
- getCapabilities()
- startSession()
- enableAcceptance()
- getAcceptedItems()
- getRejectedItems()
- presentAmount()
- commitCash()
- returnCash()
- getContainerStatus()
- enterCollectionMode()
- closeSession()
- getHealth()
```

Mansa ne doit pas dépendre d’un seul constructeur.

## 31. Capacités matérielles

Chaque appareil expose ses capacités :

```text
acceptsNotes
acceptsCoins
supportsEscrow
supportsCashReturn
supportsMixedDenominations
supportsSuspectRetention
supportsBagDeposit
supportsSmartSafe
supportsOfflineEventStore
supportsReceipt
supportsQrScanner
supportsNfc
```

L’interface utilisateur doit refléter uniquement les capacités réellement disponibles.

## 32. UX automate

L’écran doit afficher clairement :

- bénéficiaire ;
- devise ;
- montant reconnu ;
- montant rejeté ;
- frais ;
- action attendue ;
- état final ;
- référence de dépôt.

Les langues doivent utiliser le module de localisation Mansa.

Au Mali, le français, le bamanankan et l’anglais doivent pouvoir être proposés selon configuration, avec langues supplémentaires si nécessaires.

## 33. Accessibilité

Prévoir :

- contraste élevé ;
- taille de texte adaptée ;
- parcours court ;
- feedback visuel et sonore configurable ;
- aide/interphone ;
- hauteur accessible selon matériel ;
- alternatives aux informations uniquement colorées.

## 34. Reçus et notifications

Le reçu peut être :

- imprimé ;
- envoyé dans l’application ;
- envoyé par canal numérique autorisé ;
- exporté.

Il doit distinguer :

```text
CASH_ACCEPTED
CREDIT_PENDING
CREDITED
CASH_RETURNED
DISPUTED
```

Un reçu `CREDIT_PENDING` ne doit pas être présenté comme une confirmation définitive de crédit.

## 35. Intégration ledger

Le crédit doit utiliser le ledger Mansa existant.

Aucune table métier de dépôt ne doit devenir une source de vérité alternative du solde.

Le ledger doit conserver :

- montant ;
- devise ;
- compte crédité ;
- référence dépôt ;
- statut ;
- écritures de frais ;
- écritures de commission ;
- éventuelle compensation.

## 36. Intégration partenaires bancaires

Selon le modèle :

```text
Mansa reçoit le cash pour compte partenaire
banque reçoit le cash via automate connecté
prestataire collecte puis dépose en banque
commerçant dépose ses recettes dans un coffre intelligent
```

Chaque modèle doit définir responsabilité financière, moment du crédit, règlement et procédure d’écart.

## 37. Monitoring

Mesures recommandées :

```text
deposits_total
deposits_value
accepted_notes_total
rejected_notes_total
suspect_notes_total
cash_return_failures
credit_pending_count
credit_latency
container_fill_ratio
reconciliation_discrepancies
device_offline_duration
```

## 38. Alertes

Alertes possibles :

- automate presque plein ;
- automate plein ;
- taux de rejet anormal ;
- cash return bloqué ;
- cassette incohérente ;
- crédit en attente trop longtemps ;
- écart de rapprochement ;
- ouverture non autorisée ;
- appareil hors ligne ;
- capteur critique défaillant.

## 39. Incidents et litiges

Le support doit pouvoir reconstruire :

```text
session
identification
items acceptés/rejetés
montant affiché
confirmation
commit physique
crédit ledger
logs appareil
collecte
comptage
rapprochement
```

Les données sensibles doivent rester masquées selon les rôles.

## 40. Administration

L’administration doit pouvoir :

- activer/désactiver le cash-in ;
- configurer appareils et sites ;
- définir limites ;
- définir frais et commissions ;
- définir coupures acceptées ;
- définir horaires ;
- suspendre un appareil ;
- suivre inventaire et capacité ;
- ouvrir un incident ;
- approuver une correction ;
- consulter les audits.

## 41. Rôles

Exemples :

```text
CASH_DEPOSIT_OPERATOR
CASH_COLLECTION_AGENT
CASH_COUNTER
CASH_SUPERVISOR
FINANCE_APPROVER
DEVICE_TECHNICIAN
RISK_ANALYST
COMPLIANCE_ANALYST
AUDITOR
SUPPORT_AGENT
```

Les permissions doivent être fines et scoped par organisation/site.

## 42. Tests obligatoires

Inclure au minimum :

- dépôt nominal ;
- billets rejetés ;
- dépôt partiel ;
- annulation avant commit ;
- échec de retour cash ;
- perte réseau avant commit ;
- perte réseau après commit physique ;
- retry du crédit ;
- double webhook ;
- redémarrage appareil ;
- cassette pleine ;
- montant physique différent ;
- correction compensatrice ;
- accès inter-tenant interdit ;
- permissions insuffisantes ;
- dépassement limite ;
- cas fraude ;
- rapprochement avec écart ;
- reprise après incident.

## 43. Critères de recette

Le module est recevable lorsque :

1. aucun scénario de retry ne produit de double crédit ;
2. un dépôt ne peut être crédité sans preuve du cash selon la politique configurée ;
3. les montants acceptés et rejetés sont traçables ;
4. la devise XOF est validée sur le matériel réellement retenu ;
5. les cassettes/contenants sont rapprochables ;
6. les écarts nécessitent une procédure auditable ;
7. les permissions empêchent l’accès inter-tenant ;
8. le mode hors ligne ne crée pas de crédit incontrôlé ;
9. les incidents sont reconstructibles ;
10. l’intégration ledger reste la source de vérité financière.

## 44. Déploiement progressif

Le déploiement peut suivre :

```text
Phase 1 : dépôt assisté par agents sélectionnés
Phase 2 : coffres intelligents commerçants pilotes
Phase 3 : automates de dépôt sur sites prioritaires
Phase 4 : extension banques, entreprises et administrations
Phase 5 : réseau multi-pays
```

Mansa ne doit pas imposer le remplacement immédiat de l’infrastructure existante.

## 45. Modèles commerciaux

Le système doit supporter :

1. matériel acheté directement par la banque, l’État, le commerçant ou l’exploitant puis intégré à Mansa ;
2. matériel fourni, intégré ou revendu par Mansa ;
3. matériel opéré par un prestataire tiers avec intégration contractuelle.

Les responsabilités opérationnelles et financières doivent être explicites.

## 46. Marque blanche

Les écrans, reçus, boîtiers et interfaces peuvent être personnalisés par organisation :

- logo ;
- nom ;
- couleurs ;
- langues ;
- messages ;
- mentions légales ;
- aide ;
- co-branding.

La mention `Propulsé par Mansa` doit rester facultative selon le contrat et la politique de marque blanche.

## 47. Relation avec le domaine ATM

Le module ATM existant reste responsable des retraits et de l’accès aux espèces.

Le présent module ajoute la direction inverse :

```text
cash physique
-> validation
-> prise de contrôle
-> rapprochement
-> crédit numérique
```

Les composants communs — appareil, site, cassette, maintenance, monitoring, sécurité, audit — doivent être réutilisés ou factorisés afin d’éviter des implémentations parallèles incohérentes.

## 48. Hors périmètre initial

Peuvent rester hors première version :

- reconnaissance avancée de pièces sur tous les automates ;
- recyclage automatique des billets déposés vers les retraits ;
- crédit instantané de gros dépôts commerciaux non comptés ;
- traitement autonome de billets suspects sans partenaire ;
- gestion de devises exotiques sans validation matérielle.

L’architecture doit néanmoins permettre ces extensions.

## 49. Résultat attendu

Mansa doit disposer d’un domaine cash-in capable de relier de manière fiable le monde physique et le ledger numérique, sans double crédit, avec validation matérielle, contrôle des limites, sécurité, conformité, rapprochement, gestion des écarts et déploiement progressif multi-fournisseurs.
