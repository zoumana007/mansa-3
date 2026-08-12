# 05 — Mansa Pass & Control

## 1. Objet du module

Ce document définit le cahier des charges fonctionnel, métier, technique, sécurité, exploitation et conformité du module **Mansa Pass & Control**.

Mansa Pass & Control constitue une plateforme transverse de **titres numériques, abonnements, badges, droits d’accès et contrôle terrain**. Le module doit pouvoir être réutilisé pour plusieurs secteurs sans être recodé à chaque intégration :

- transports publics urbains et interurbains ;
- bus, autocars, navettes, BRT, tramway, train ou autres réseaux lorsque des opérateurs partenaires sont disponibles ;
- établissements scolaires et universitaires ;
- entreprises et sites professionnels ;
- événements, salons, stades et lieux culturels ;
- administrations et services publics ;
- parkings et accès contrôlés ;
- programmes d’abonnement ou de mobilité ;
- cartes étudiantes ou professionnelles non bancaires ;
- futurs cas d’usage autorisés par pays et partenaire.

Le module comprend deux ensembles complémentaires :

1. **Mansa Pass** : création, émission, stockage, achat, renouvellement, affichage et gestion des titres ou droits d’accès ;
2. **Mansa Control** : validation, inspection, contrôle d’accès, gestion des équipements de contrôle, fonctionnement hors ligne et remontée sécurisée des événements de contrôle.

Le module doit être **multi-tenant, multi-pays, multi-opérateur, multi-réseau et multi-devise**. Il ne doit jamais supposer qu’un réseau de transport, une école, une entreprise ou une administration a signé un contrat avec Mansa. Toute capacité partenaire doit rester abstraite, configurable et activable uniquement lorsqu’elle est réellement disponible.

Le module ne doit pas être confondu avec une carte bancaire. Une carte Mansa Pass physique peut être un support d’identification ou de transport sans fonction EMV de paiement. Les fonctions bancaires restent dans les modules de paiement/cartes correspondants.

---

## 2. Principes directeurs

1. **Un moteur, plusieurs secteurs** : titres et droits d’accès reposent sur des concepts communs, puis sont spécialisés par produit.
2. **Offline-first pour le contrôle** : un contrôleur ou valideur doit pouvoir prendre une décision locale sûre lorsque le réseau est faible ou absent.
3. **Cryptographic trust** : un QR ou credential hors ligne doit être signé et vérifiable sans dépendre d’une capture d’écran ou d’un simple identifiant incrémental.
4. **No double use** : prévenir, détecter et réconcilier les doubles validations, replays et duplications.
5. **Multi-support** : application Mansa, QR dynamique/statique sécurisé selon produit, NFC, carte physique non bancaire, Apple Wallet/Google Wallet lorsque les contrats et plateformes le permettent.
6. **Partner abstraction** : intégrations transport, billettique, wallet tiers, contrôle d’accès et identité derrière des interfaces stables.
7. **Privacy by design** : un contrôleur ne voit que les informations nécessaires à sa mission.
8. **Pricing configurable** : aucun tarif, frais, commission ou partage de revenu n’est codé en dur.
9. **Audit immuable** : émission, modification, validation, annulation, contrôle manuel et changement tarifaire sont traçables.
10. **Fail-safe configurable** : selon le secteur, un incident doit mener soit à un refus sûr, soit à une politique de tolérance contrôlée et auditée.
11. **Feature flags réglementaires et contractuels** : chaque capacité peut être activée par pays, organisation, réseau, ligne, produit ou canal.
12. **Séparation paiement / droit d’accès** : le paiement peut financer le titre, mais le titre possède ensuite son propre cycle de vie et ses propres preuves.

---

## 3. Acteurs

### 3.1 Utilisateur final

Peut selon ses droits :

- découvrir les offres disponibles ;
- acheter ou recevoir un pass ;
- présenter un QR ou utiliser un support NFC ;
- ajouter un pass dans un wallet tiers si disponible ;
- renouveler un abonnement ;
- consulter validité, trajets, historique et conditions ;
- déclarer la perte d’un support physique ;
- transférer un titre uniquement si le produit l’autorise ;
- recevoir un remboursement ou avoir selon politique.

### 3.2 Contrôleur / agent terrain

Utilise Mansa Control pour :

- scanner un QR ;
- lire un support NFC ;
- vérifier localement un titre ;
- consulter un résultat minimal ;
- enregistrer une inspection ;
- justifier une dérogation ;
- remonter une anomalie ;
- synchroniser les contrôles ;
- fonctionner hors connexion dans les limites prévues.

### 3.3 Conducteur / valideur embarqué

Selon le réseau, un appareil embarqué ou terminal fixe peut :

- valider montée/entrée ;
- éventuellement valider descente/sortie ;
- afficher acceptation/refus ;
- fonctionner en mode local ;
- accumuler les événements de validation ;
- synchroniser à la reconnexion.

### 3.4 Opérateur / organisation cliente

Peut gérer :

- réseaux ;
- lignes ;
- zones ;
- arrêts ;
- sites ;
- événements ;
- catégories de pass ;
- périodes de validité ;
- tarifs ;
- règles d’éligibilité ;
- équipements ;
- contrôleurs ;
- remboursements ;
- rapports ;
- commissions ;
- incidents.

### 3.5 Administration Mansa

Gère les capacités transversales :

- organisations partenaires ;
- politiques pays ;
- contrats techniques ;
- clés et certificats via coffre de secrets/HSM ;
- feature flags ;
- pricing engine ;
- commissions ;
- fraude ;
- supervision ;
- audit ;
- support niveau plateforme.

### 3.6 Émetteur / autorité

Pour certains produits, l’entité qui émet juridiquement le titre peut être distincte de l’opérateur technique. Le modèle doit donc distinguer :

- `ISSUER` ;
- `OPERATOR` ;
- `DISTRIBUTOR` ;
- `ACQUIRER/PAYMENT_PARTNER` si paiement ;
- `CONTROL_OPERATOR` ;
- `MANSA_PLATFORM`.

---

## 4. Périmètre fonctionnel — Mansa Pass

### 4.1 Catalogue de produits

Le catalogue doit supporter au minimum :

- billet unitaire ;
- carnet de N trajets ;
- pass journalier ;
- pass hebdomadaire ;
- pass mensuel ;
- pass annuel ;
- abonnement récurrent ;
- titre étudiant ;
- titre salarié ;
- titre senior ;
- titre social/subventionné ;
- titre événementiel ;
- badge d’accès entreprise ;
- badge scolaire/universitaire ;
- pass visiteur ;
- titre nominatif ;
- titre non nominatif lorsque permis ;
- titre à nombre limité d’entrées ;
- titre valable sur une zone, ligne ou réseau ;
- pass multimodal lorsque les partenaires le permettent.

Chaque produit doit définir explicitement :

- émetteur ;
- organisation propriétaire ;
- pays ;
- devise ;
- zone géographique ;
- règles de validité ;
- période de vente ;
- période d’utilisation ;
- nombre de validations autorisées ;
- règles de correspondance ;
- règles de transfert ;
- règles de remboursement ;
- justificatifs requis ;
- éligibilité ;
- canaux de distribution ;
- supports compatibles ;
- politique hors ligne ;
- politique tarifaire et version associée.

### 4.2 Achat d’un pass

Parcours cible :

1. choisir organisation/réseau/service ;
2. consulter produits disponibles selon profil et pays ;
3. sélectionner un produit ;
4. fournir les informations ou justificatifs strictement nécessaires ;
5. vérifier éligibilité ;
6. calculer tarif, réduction, subvention, taxes et frais ;
7. afficher un récapitulatif avant paiement ;
8. payer via un moyen autorisé par Mansa et le partenaire ;
9. attendre confirmation de paiement fiable ;
10. émettre le pass ;
11. générer ses credentials ;
12. afficher/installer le pass ;
13. générer reçu ;
14. planifier renouvellement si abonnement.

Un paiement réussi sans émission du pass doit passer dans une file de récupération automatique et ne jamais être perdu silencieusement.

### 4.3 Attribution sans paiement

Certains pass peuvent être émis sans achat direct :

- carte étudiante fournie par l’établissement ;
- pass salarié pris en charge par l’entreprise ;
- titre social subventionné ;
- accréditation événementielle ;
- pass visiteur ;
- pass promotionnel ;
- remplacement après incident.

Toute émission gratuite doit indiquer son motif et l’entité qui en supporte éventuellement le coût.

### 4.4 Renouvellement

Le module doit supporter :

- renouvellement manuel ;
- renouvellement automatique opt-in ;
- renouvellement anticipé ;
- période de grâce ;
- suspension ;
- reprise ;
- changement de formule ;
- renouvellement conditionné à un justificatif à jour ;
- renouvellement financé par employeur/administration.

Un renouvellement automatique doit respecter les règles de consentement et de paiement applicables.

### 4.5 Support QR

Le système doit supporter plusieurs stratégies selon le niveau de risque :

#### QR dynamique

Recommandé pour les titres personnels à risque de partage.

Caractéristiques :

- payload signé ;
- identifiant de credential pseudonymisé ;
- fenêtre temporelle courte ;
- nonce ou compteur ;
- rotation ;
- vérification locale possible avec clé publique ;
- aucune donnée personnelle sensible en clair.

#### QR statique signé

Peut être utilisé pour des produits moins sensibles ou supports imprimés.

Il doit :

- être signé ;
- inclure une version ;
- expirer ou être révocable ;
- ne jamais contenir un simple ID permettant de forger un pass ;
- être associé à des règles anti-replay.

Le backend doit pouvoir désactiver le QR statique pour certains produits.

### 4.6 Support NFC

Le module doit abstraire plusieurs supports :

- NFC du téléphone lorsque la plateforme le permet ;
- carte physique contactless ;
- badge d’entreprise ;
- carte étudiante ;
- support de transport partenaire.

Le système ne doit pas supposer qu’un iPhone ou Android expose les mêmes capacités NFC. Les implémentations sont pilotées par `CredentialProvider` et feature flags par plateforme.

Un UID NFC brut ne doit pas être considéré comme secret suffisant pour autoriser un accès sensible. Les supports doivent utiliser un mécanisme cryptographique ou une vérification backend selon la technologie réellement disponible.

### 4.7 Carte physique Mansa Pass

La carte physique peut être :

- nominative ;
- anonyme selon produit ;
- personnalisée au nom d’un réseau ou d’une institution ;
- co-brandée ;
- sans fonction bancaire ;
- liée à plusieurs titres compatibles.

Fonctions :

- activation ;
- suspension ;
- remplacement ;
- migration des titres vers une nouvelle carte si permis ;
- liste noire ;
- association/dissociation contrôlée ;
- inventaire des cartes ;
- gestion des lots ;
- statut fabrication/distribution.

### 4.8 Apple Wallet / Google Wallet

Le module peut exposer des connecteurs vers Apple Wallet et Google Wallet lorsque les comptes développeurs, contrats, certifications et politiques nécessaires sont disponibles.

L’architecture doit permettre :

- génération d’un pass compatible ;
- mise à jour de statut ;
- expiration ;
- révocation ;
- deep link d’ajout ;
- personnalisation par organisation ;
- QR/code-barres compatibles selon capacités ;
- synchronisation des changements.

Mansa ne doit jamais promettre l’usage de NFC natif ou d’un type de credential non autorisé par la plateforme.

### 4.9 Partage et transfert

Par défaut, un titre nominatif n’est pas transférable.

Pour les produits transférables :

- transfert explicitement activé ;
- destinataire identifié ;
- ancien credential révoqué ;
- nouveau credential émis ;
- historique conservé ;
- frais éventuels via Pricing Engine ;
- limites anti-fraude ;
- impossibilité de transférer un titre déjà consommé ou bloqué.

### 4.10 Remboursement, avoir et annulation

Selon produit :

- annulation avant activation ;
- remboursement total ;
- remboursement prorata ;
- avoir ;
- remplacement gratuit ;
- frais d’annulation ;
- non-remboursable ;
- annulation par opérateur ;
- remboursement massif en cas d’incident.

Le remboursement financier doit être orchestré avec le module de paiement, mais le statut du titre doit être cohérent avant toute restitution définitive.

---

## 5. Périmètre fonctionnel — Transport

### 5.1 Réseaux et topologie

Le module doit représenter :

- réseau ;
- sous-réseau ;
- mode de transport ;
- lignes ;
- variantes de lignes ;
- directions ;
- arrêts/stations ;
- zones tarifaires ;
- pôles d’échange ;
- dépôts ;
- véhicules ;
- valideurs ;
- calendriers de service.

L’intégration avec un référentiel GTFS ou autre standard peut être prévue derrière un importateur, mais ne doit pas être imposée lorsque le partenaire n’en dispose pas.

### 5.2 Validation entrée seule

Cas simple :

- utilisateur présente son credential ;
- valideur vérifie signature/statut ;
- applique règles d’accès ;
- enregistre validation ;
- affiche/émet signal sonore ;
- synchronise.

### 5.3 Tap-in / Tap-out

Pour tarification selon trajet :

- validation d’entrée ;
- ouverture d’un `JourneySession` ;
- validation de sortie ;
- calcul du trajet ;
- calcul du tarif final selon règles ;
- clôture ;
- traitement du cas de sortie manquante.

Si un pass illimité couvre le trajet, le moteur peut enregistrer la session sans débit variable.

### 5.4 Correspondances

Les règles doivent permettre :

- correspondance gratuite pendant N minutes ;
- correspondance avec réduction ;
- nombre maximal de correspondances ;
- restrictions par réseau/ligne/mode ;
- fenêtre temporelle ;
- règles spécifiques aux pass.

Les règles doivent être versionnées pour reproduire le calcul historique.

### 5.5 Tarification transport

Supporter :

- tarif plat ;
- tarif par zone ;
- tarif par distance ;
- tarif origine-destination ;
- peak/off-peak ;
- étudiant/senior/social ;
- plafond journalier/hebdomadaire si activé ;
- carnet ;
- abonnement ;
- gratuité ;
- subvention publique ;
- prise en charge employeur ;
- promotions.

Le tarif du service et les **frais Mansa** doivent être modélisés séparément.

---

## 6. Périmètre fonctionnel — Entreprise, école, administration et événements

### 6.1 Contrôle d’accès entreprise

Le pass peut représenter :

- employé ;
- prestataire ;
- visiteur ;
- véhicule ;
- badge temporaire ;
- accès à des zones précises ;
- plages horaires ;
- niveau d’habilitation.

La décision d’accès peut dépendre de :

- site ;
- porte/zone ;
- date/heure ;
- statut employé ;
- habilitation ;
- révocation ;
- présence déjà enregistrée.

### 6.2 Établissements scolaires/universitaires

Cas d’usage :

- carte étudiante ;
- accès campus ;
- bibliothèque ;
- restaurant universitaire si partenaire ;
- transport étudiant ;
- événements internes ;
- contrôle d’identité minimal.

Les données académiques détaillées ne doivent pas être exposées au contrôleur si elles ne sont pas nécessaires.

### 6.3 Événements

Supporter :

- billet général ;
- VIP ;
- presse ;
- staff ;
- exposant ;
- journée unique ;
- multi-jour ;
- zone/tribune ;
- siège si pertinent ;
- re-entry autorisée ou interdite ;
- contrôle à plusieurs périmètres.

Le système doit prévenir la duplication de billets et permettre une synchronisation rapide de listes de révocation.

### 6.4 Administration / services publics

Le module peut servir de support à :

- carte d’agent ;
- badge d’accès ;
- titre de service ;
- justificatif numérique limité ;
- pass de transport subventionné.

Toute identité officielle forte doit rester dépendante des cadres et partenaires autorisés ; Mansa ne doit pas se présenter comme autorité d’identité sans mandat.

---

## 7. Mansa Control — application et équipements de contrôle

### 7.1 Application Control

L’application doit être conçue prioritairement pour Android, tout en gardant une abstraction pour d’autres plateformes.

Fonctions :

- authentification contrôleur ;
- chargement de mission ;
- synchronisation des clés publiques et politiques ;
- scan QR par caméra ;
- lecture NFC si matériel compatible ;
- affichage décision ;
- vibration/son ;
- historique local de session ;
- signalement incident ;
- mode hors ligne ;
- synchronisation ;
- diagnostic équipement ;
- révocation de session distante.

### 7.2 Terminaux supportés

Le module doit être multi-fournisseurs :

- smartphone professionnel ;
- PDA durci ;
- terminal Android industriel ;
- valideur embarqué ;
- borne fixe ;
- tourniquet/gate via adaptateur ;
- lecteur NFC/QR externe.

Les équipements sont intégrés via interfaces :

- `ScannerAdapter` ;
- `NfcReaderAdapter` ;
- `GateControllerAdapter` ;
- `DeviceTelemetryAdapter` ;
- `SecureElementAdapter` si disponible.

### 7.3 Résultat de contrôle

Le contrôleur reçoit un résultat simple :

- `VALID` ;
- `VALID_WITH_WARNING` ;
- `EXPIRED` ;
- `NOT_YET_VALID` ;
- `REVOKED` ;
- `ALREADY_USED` ;
- `WRONG_ZONE` ;
- `WRONG_LINE` ;
- `WRONG_EVENT` ;
- `NO_REMAINING_RIDES` ;
- `SIGNATURE_INVALID` ;
- `UNKNOWN_CREDENTIAL` ;
- `OFFLINE_POLICY_DENIED` ;
- `MANUAL_REVIEW` ;
- `DEVICE_NOT_TRUSTED` ;
- `SYSTEM_ERROR`.

L’écran doit privilégier lisibilité, vitesse et accessibilité, sans exposer de détails techniques inutiles.

### 7.4 Données minimales visibles

Par défaut, un contrôleur ne voit que :

- résultat ;
- type de pass ;
- période de validité ;
- photo si réellement requise pour un titre nominatif ;
- prénom/initiale ou identifiant masqué lorsque nécessaire ;
- zone/ligne/événement ;
- motif de refus lisible.

Adresse, téléphone, email, historique financier, solde wallet ou données KYC complètes ne doivent pas être visibles.

### 7.5 Contrôle manuel / dérogation

Une dérogation peut être autorisée uniquement si politique locale activée.

Elle exige :

- rôle adéquat ;
- motif codifié ;
- commentaire si nécessaire ;
- horodatage ;
- appareil ;
- localisation approximative si consentie/nécessaire ;
- signature de l’agent/session ;
- audit ;
- synchronisation.

Les dérogations répétées doivent déclencher une alerte fraude/opérations.

---

## 8. Fonctionnement hors ligne

### 8.1 Objectif

Le contrôle doit rester opérationnel lors de :

- coupure Internet ;
- réseau mobile faible ;
- véhicule en déplacement ;
- station souterraine ;
- saturation temporaire.

### 8.2 Données embarquées

Un terminal de contrôle peut télécharger un bundle signé contenant :

- clés publiques actives ;
- anciennes clés encore nécessaires ;
- règles de validation compilées ;
- version de politique ;
- listes de révocation compactes ;
- configuration réseau/ligne/site ;
- paramètres de tolérance ;
- fenêtre de validité du bundle.

Le bundle ne doit contenir aucun secret serveur maître.

### 8.3 Validation offline

Le terminal vérifie localement :

- signature ;
- période du credential ;
- issuer ;
- produit ;
- contexte ;
- nonce/compteur lorsque disponible ;
- politique locale ;
- révocation connue ;
- replay local ;
- validité de sa propre configuration.

### 8.4 File d’événements

Chaque événement offline est stocké dans une file locale chiffrée :

- idempotency key ;
- timestamp appareil ;
- séquence monotone ;
- credential pseudonymisé ;
- décision ;
- contexte ;
- policyVersion ;
- deviceId ;
- controllerSessionId ;
- preuve cryptographique si disponible.

À la reconnexion :

1. authentification du terminal ;
2. envoi par lots ;
3. déduplication ;
4. détection des conflits ;
5. réconciliation ;
6. réception de nouvelles politiques ;
7. purge sécurisée selon rétention.

### 8.5 Conflits et double utilisation

Si deux terminaux offline valident le même titre à usage unique :

- les deux événements sont conservés ;
- la première validation selon politique de réconciliation est acceptée comme consommation principale ;
- la seconde est marquée `REPLAY_CONFLICT` ou équivalent ;
- aucune donnée n’est supprimée pour masquer le conflit ;
- un score risque est mis à jour ;
- les opérations peuvent décider d’une action selon le produit.

### 8.6 Expiration offline

Un terminal dont le bundle de confiance est trop ancien doit :

- tenter une resynchronisation ;
- appliquer une période de grâce uniquement si configurée ;
- sinon passer en mode dégradé/refus sûr ;
- afficher clairement son état à l’agent.

---

## 9. Architecture de credentials et sécurité cryptographique

### 9.1 Credential abstrait

Tout pass matérialisable doit produire un `PassCredential` avec :

- version ;
- issuer ;
- passInstanceId pseudonymisé ;
- credentialId ;
- productId ;
- validFrom ;
- validUntil ;
- usagePolicy ;
- context restrictions ;
- keyId ;
- signature ;
- rotation metadata selon type.

### 9.2 Gestion des clés

Les clés privées de signature :

- ne sont jamais stockées dans le dépôt ;
- sont protégées par KMS/HSM ou coffre de secrets approprié ;
- sont séparées par environnement ;
- sont rotatives ;
- possèdent un `kid` ;
- ont une période d’activation et de retrait ;
- sont auditées.

Les terminaux reçoivent uniquement les clés publiques nécessaires.

### 9.3 Rotation

Une rotation doit permettre :

- nouvelle clé active ;
- période de chevauchement ;
- validation des credentials historiques encore valides ;
- révocation d’urgence ;
- diffusion accélérée vers terminaux ;
- audit complet.

### 9.4 Anti-copie

Aucun support logiciel ne peut garantir à lui seul qu’une capture d’écran n’existe pas. Le module doit réduire le risque via :

- QR dynamique ;
- courte durée ;
- nonce ;
- binding appareil facultatif ;
- contrôle photo facultatif ;
- replay detection ;
- compteur d’usage ;
- synchronisation des consommations ;
- score de risque.

---

## 10. Machines d’état

### 10.1 PassInstance

`DRAFT -> PENDING_PAYMENT | PENDING_ELIGIBILITY -> ISSUED -> ACTIVE -> EXPIRED`

Branches :

- `SUSPENDED` ;
- `REVOKED` ;
- `CANCELLED` ;
- `REFUNDED` ;
- `REPLACED` ;
- `CONSUMED` pour usage unique.

### 10.2 Credential

`GENERATED -> ACTIVE -> ROTATED | EXPIRED | REVOKED | REPLACED`

### 10.3 ValidationEvent

`CAPTURED -> LOCALLY_DECIDED -> SYNC_PENDING -> RECEIVED -> RECONCILED`

Branches :

- `DUPLICATE` ;
- `REPLAY_CONFLICT` ;
- `REJECTED_BY_SERVER_POLICY` ;
- `MANUAL_REVIEW`.

### 10.4 Abonnement

`DRAFT -> ACTIVE -> RENEWAL_DUE -> RENEWING -> ACTIVE`

Branches :

- `PAST_DUE` ;
- `GRACE_PERIOD` ;
- `SUSPENDED` ;
- `CANCELLED` ;
- `EXPIRED`.

### 10.5 Équipement

`PROVISIONING -> ACTIVE -> DEGRADED | OFFLINE -> ACTIVE`

Branches :

- `SUSPENDED` ;
- `COMPROMISED` ;
- `RETIRED` ;
- `LOST`.

Les transitions invalides doivent être rejetées par le backend et auditées si elles sont tentées par un acteur privilégié.

---

## 11. Modèle de données cible

### 11.1 PassOrganization

- id
- tenantId
- legalName
- displayName
- organizationType
- countryCode
- status
- defaultCurrency
- brandingConfig
- createdAt
- updatedAt

### 11.2 PassIssuer

- id
- organizationId
- issuerCode
- issuerType
- status
- publicMetadata
- signingPolicyId

### 11.3 PassNetwork

- id
- organizationId
- code
- name
- networkType
- countryCode
- timezone
- status

### 11.4 TransitLine

- id
- networkId
- code
- name
- mode
- directionModel
- status

### 11.5 TransitStop

- id
- networkId
- code
- name
- latitude nullable
- longitude nullable
- zoneId nullable
- status

### 11.6 FareZone

- id
- networkId
- code
- name
- geometryReference nullable
- status

### 11.7 PassProduct

- id
- organizationId
- issuerId
- networkId nullable
- productType
- name
- description
- nominalPrice
- currency
- validityPolicyJson
- usagePolicyJson
- eligibilityPolicyId nullable
- refundPolicyId nullable
- offlinePolicyId
- transferable
- supportsQr
- supportsNfc
- supportsPhysicalCard
- supportsWalletPass
- salesStartAt nullable
- salesEndAt nullable
- status
- version

### 11.8 PassEligibilityPolicy

- id
- organizationId
- policyType
- rulesJson
- requiredEvidenceTypes
- countryCode
- version
- validFrom
- validUntil nullable

### 11.9 PassInstance

- id
- productId
- ownerUserId nullable
- beneficiaryRef nullable
- organizationId
- issuerId
- status
- validFrom
- validUntil
- remainingUses nullable
- activationAt nullable
- paymentTransactionId nullable
- pricingSnapshotId nullable
- subsidyAllocationId nullable
- source: `PURCHASE | ASSIGNMENT | IMPORT | REPLACEMENT | PROMOTION`
- createdAt
- updatedAt

### 11.10 PassCredential

- id
- passInstanceId
- credentialType: `DYNAMIC_QR | STATIC_QR | NFC | PHYSICAL_CARD | APPLE_WALLET | GOOGLE_WALLET | OTHER`
- externalCredentialRef nullable
- keyId nullable
- status
- issuedAt
- expiresAt nullable
- rotatedAt nullable
- revokedAt nullable
- deviceBindingRef nullable

Aucune clé privée ou payload secret complet n’est conservé dans un champ non chiffré.

### 11.11 PhysicalPassCard

- id
- organizationId
- cardSerial
- technologyType
- lifecycleStatus
- inventoryBatchId
- holderUserId nullable
- activatedAt nullable
- suspendedAt nullable
- replacedByCardId nullable

### 11.12 PassSubscription

- id
- userId
- productId
- paymentMandateRef nullable
- sponsorOrganizationId nullable
- status
- currentPeriodStart
- currentPeriodEnd
- nextRenewalAt
- autoRenew
- renewalPricingPolicy
- graceUntil nullable

### 11.13 ValidationDevice

- id
- organizationId
- networkId nullable
- siteId nullable
- deviceType
- hardwareVendor nullable
- hardwareModel nullable
- serialNumber nullable
- appVersion
- securityState
- status
- lastSeenAt
- lastPolicySyncAt
- currentPolicyVersion
- publicKeyRef

### 11.14 ControllerIdentity

- id
- organizationId
- userId
- employeeRef nullable
- roleSet
- status
- validFrom
- validUntil nullable

### 11.15 ControllerSession

- id
- controllerId
- deviceId
- assignmentRef nullable
- startedAt
- endedAt nullable
- authStrength
- offlineAllowedUntil
- status

### 11.16 ValidationEvent

- id
- idempotencyKey
- passInstanceRefPseudonymized
- credentialId
- deviceId
- controllerSessionId nullable
- networkId nullable
- lineId nullable
- stopId nullable
- siteId nullable
- eventId nullable
- eventType: `ENTRY | EXIT | INSPECTION | ACCESS | REENTRY | MANUAL_OVERRIDE`
- decision
- reasonCode
- policyVersion
- occurredAtDevice
- receivedAt nullable
- offline
- sequenceNumber
- reconciliationStatus
- riskFlags

### 11.17 JourneySession

- id
- passInstanceId
- entryValidationId
- exitValidationId nullable
- entryZoneId nullable
- exitZoneId nullable
- status
- calculatedFare nullable
- fareRuleVersionId nullable
- openedAt
- closedAt nullable

### 11.18 PassRevocation

- id
- credentialId nullable
- passInstanceId nullable
- reason
- requestedBy
- effectiveAt
- expiresAt nullable
- distributionPriority

### 11.19 OfflinePolicy

- id
- organizationId
- name
- maxOfflineDuration
- graceDuration
- allowUnknownCredential
- allowStaleRevocationList
- replayCacheWindow
- failMode
- version

### 11.20 PricingSnapshot

- id
- pricingRuleVersionId
- productBasePrice
- discountAmount
- subsidyAmount
- MansaFee
- operatorFee
- partnerFee
- agentCommission
- merchantCommission
- introducerCommission
- taxes
- currency
- totalDue
- createdAt

Le snapshot est immuable après transaction confirmée.

### 11.21 SettlementAllocation

- id
- transactionId
- beneficiaryType
- beneficiaryId
- amount
- currency
- reason
- settlementStatus
- externalSettlementRef nullable

### 11.22 AuditEvent

- id
- tenantId
- actorType
- actorId
- action
- targetType
- targetId
- beforeHash nullable
- afterHash nullable
- reasonCode nullable
- occurredAt
- correlationId
- sourceDeviceId nullable

---

## 12. Pricing & Commission Engine

Mansa Pass & Control doit consommer le moteur central de frais et commissions. Aucun montant de commission Mansa, opérateur, agent, commerçant, intégrateur ou apporteur ne doit être codé en dur.

### 12.1 Dimensions de tarification

Une règle peut dépendre de :

- pays ;
- organisation ;
- réseau ;
- ligne ;
- zone ;
- produit ;
- catégorie utilisateur ;
- segment client ;
- statut étudiant/salarié/senior/social ;
- canal de vente ;
- canal de validation ;
- moyen de paiement ;
- devise ;
- volume ;
- nombre de trajets ;
- heure/jour ;
- période ;
- partenaire ;
- promotion ;
- subvention ;
- type de support ;
- renouvellement initial ou récurrent.

### 12.2 Types de frais

Supporter :

- montant fixe ;
- pourcentage ;
- fixe + pourcentage ;
- minimum ;
- maximum ;
- paliers ;
- gratuité ;
- N opérations gratuites ;
- promotion temporaire ;
- remise ;
- plafond journalier/hebdomadaire ;
- frais de création de carte ;
- frais de remplacement ;
- frais de transfert ;
- frais de remboursement ;
- frais de recharge de titre si applicable.

### 12.3 Partage de revenu

Le moteur doit pouvoir ventiler séparément :

- revenu de l’émetteur/opérateur ;
- commission Mansa ;
- commission agent ;
- commission commerçant/distributeur ;
- commission partenaire technique ;
- commission apporteur ;
- taxes ;
- subvention ;
- coût sponsorisé par une entreprise/administration.

### 12.4 Cycle de vie d’une règle

`DRAFT -> SIMULATED -> PENDING_APPROVAL -> SCHEDULED -> ACTIVE -> EXPIRED | REVOKED`

Avant activation :

- simulation sur transactions historiques anonymisées ou jeux de test ;
- comparaison ancien/nouveau tarif ;
- estimation d’impact utilisateurs ;
- estimation de revenus ;
- vérification de limites ;
- approbation sensible à deux personnes si configurée.

### 12.5 Versioning

Chaque achat, renouvellement, remboursement et calcul de trajet conserve :

- `pricingRuleVersionId` ;
- détails des composantes ;
- devise ;
- taxes ;
- montant final ;
- bénéficiaires de commissions.

Modifier un tarif futur ne modifie jamais l’historique d’une transaction exécutée.

### 12.6 Tarifs de transport et frais Mansa

Les deux concepts doivent être séparés :

- **fare** = tarif du service de transport ;
- **platform/payment fees** = frais éventuels Mansa et partenaires.

L’interface doit présenter les montants selon les obligations de transparence applicables et éviter de faire passer une commission Mansa pour le prix du transport.

---

## 13. Paiement, ledger et règlement

### 13.1 Orchestration de paiement

L’achat peut être financé par les moyens activés dans Mansa :

- wallet Mansa ;
- carte bancaire via partenaire acquéreur ;
- Mobile Money via partenaire ;
- compte bancaire connecté lorsque disponible ;
- prise en charge entreprise ;
- subvention publique ;
- bon ou crédit interne autorisé.

Aucun canal n’est garanti sans contrat réel.

### 13.2 Saga achat → émission

La transaction doit gérer les scénarios :

- paiement refusé ;
- paiement autorisé mais émission échouée ;
- émission réussie mais réponse mobile perdue ;
- webhook dupliqué ;
- remboursement après erreur ;
- timeout partenaire.

La saga doit être idempotente et récupérable.

### 13.3 Ledger

Les mouvements financiers doivent être équilibrés et séparés du registre des validations.

Comptes techniques possibles :

- `USER_WALLET_AVAILABLE` ;
- `PASS_SALES_RECEIVABLE` ;
- `OPERATOR_SETTLEMENT_PAYABLE` ;
- `MANSA_FEE_REVENUE` ;
- `AGENT_COMMISSION_PAYABLE` ;
- `MERCHANT_COMMISSION_PAYABLE` ;
- `PARTNER_FEE_PAYABLE` ;
- `INTRODUCER_COMMISSION_PAYABLE` ;
- `TAX_PAYABLE` ;
- `SUBSIDY_RECEIVABLE` ;
- `REFUND_PAYABLE`.

### 13.4 Réconciliation

Réconcilier au minimum :

- ventes Mansa ;
- paiements partenaires ;
- pass émis ;
- remboursements ;
- commissions ;
- validations ;
- règlements opérateurs ;
- subventions.

Les écarts doivent être classés et traités sans altérer l’historique.

---

## 14. RBAC et ABAC

### 14.1 Rôles fonctionnels

- `PASS_USER`
- `PASS_CONTROLLER`
- `PASS_CONTROLLER_SUPERVISOR`
- `PASS_OPERATOR_SUPPORT`
- `PASS_OPERATOR_ADMIN`
- `PASS_PRODUCT_ADMIN`
- `PASS_PRICING_ADMIN`
- `PASS_FINANCE`
- `PASS_SETTLEMENT_ANALYST`
- `PASS_FRAUD_ANALYST`
- `PASS_SECURITY_ADMIN`
- `PASS_DEVICE_ADMIN`
- `PASS_AUDITOR`
- `MANSA_PLATFORM_ADMIN`
- `SUPER_ADMIN`

### 14.2 Attributs ABAC

Une permission peut dépendre de :

- tenant ;
- pays ;
- organisation ;
- réseau ;
- site ;
- ligne ;
- mission ;
- appareil ;
- horaire ;
- niveau d’authentification ;
- environnement ;
- niveau de risque ;
- type de produit.

### 14.3 Séparation des tâches

À minima :

- créateur d’une règle tarifaire ≠ approbateur si règle sensible ;
- administrateur équipement ≠ auditeur ;
- contrôleur terrain ne peut pas modifier les produits ;
- support ne peut pas modifier arbitrairement le ledger ;
- finance ne peut pas révoquer une preuve d’accès sans permission dédiée.

---

## 15. APIs cibles

Les noms ci-dessous sont indicatifs et doivent respecter les conventions générales du backend Mansa.

### 15.1 Catalogue

- `GET /pass/products`
- `GET /pass/products/:id`
- `POST /pass/products` — administration
- `PATCH /pass/products/:id`
- `POST /pass/products/:id/publish`

### 15.2 Achat et émission

- `POST /pass/orders`
- `GET /pass/orders/:id`
- `POST /pass/orders/:id/confirm`
- `POST /pass/orders/:id/cancel`
- `POST /pass/orders/:id/refund`
- `GET /pass/me/passes`
- `GET /pass/passes/:id`
- `POST /pass/passes/:id/suspend`
- `POST /pass/passes/:id/replace`

### 15.3 Credentials

- `POST /pass/passes/:id/credentials`
- `GET /pass/passes/:id/credentials/active`
- `POST /pass/credentials/:id/rotate`
- `POST /pass/credentials/:id/revoke`
- `POST /pass/credentials/:id/wallet-link`

### 15.4 Abonnements

- `POST /pass/subscriptions`
- `GET /pass/subscriptions/:id`
- `PATCH /pass/subscriptions/:id`
- `POST /pass/subscriptions/:id/cancel`
- `POST /pass/subscriptions/:id/renew`

### 15.5 Control

- `POST /control/devices/register`
- `POST /control/devices/:id/activate`
- `POST /control/devices/:id/suspend`
- `GET /control/devices/:id/policy-bundle`
- `POST /control/sessions`
- `POST /control/validations`
- `POST /control/validations/batch`
- `GET /control/revocations/delta`
- `POST /control/incidents`

### 15.6 Réseau transport

- `GET /pass/networks`
- `GET /pass/networks/:id/lines`
- `GET /pass/networks/:id/stops`
- `GET /pass/networks/:id/fare-zones`
- `POST /pass/journeys/open`
- `POST /pass/journeys/:id/close`

### 15.7 Administration/pricing

- `GET /admin/pass/pricing-rules`
- `POST /admin/pass/pricing-rules`
- `POST /admin/pass/pricing-rules/:id/simulate`
- `POST /admin/pass/pricing-rules/:id/approve`
- `POST /admin/pass/pricing-rules/:id/schedule`
- `POST /admin/pass/pricing-rules/:id/revoke`

Toutes les écritures sensibles exigent idempotency key et audit context.

---

## 16. Webhooks et événements internes

### 16.1 Événements métier

- `pass.order.created`
- `pass.payment.confirmed`
- `pass.issued`
- `pass.activated`
- `pass.suspended`
- `pass.revoked`
- `pass.expired`
- `pass.refunded`
- `pass.credential.rotated`
- `pass.subscription.renewal_due`
- `pass.subscription.renewed`
- `control.validation.accepted`
- `control.validation.rejected`
- `control.validation.replay_detected`
- `control.device.offline`
- `control.device.compromised`
- `control.policy.updated`
- `pass.settlement.created`
- `pass.settlement.reconciled`

### 16.2 Webhooks partenaires

Les webhooks sortants doivent :

- être signés ;
- avoir un timestamp ;
- contenir un event id unique ;
- être rejouables ;
- utiliser retry exponentiel ;
- aller en dead-letter queue après seuil ;
- exposer statut de livraison ;
- permettre rotation de secret.

Les webhooks entrants doivent :

- vérifier signature ;
- gérer replay ;
- être idempotents ;
- ne jamais faire confiance à un simple statut sans réconciliation.

---

## 17. Interfaces partenaires

Prévoir au minimum :

### 17.1 `TransitOperatorProvider`

Capacités possibles :

- synchroniser catalogue ;
- émettre un titre externe ;
- annuler ;
- vérifier statut ;
- récupérer réseau/topologie ;
- remonter validations ;
- recevoir règlement.

### 17.2 `WalletPassProvider`

Implémentations futures :

- Apple Wallet ;
- Google Wallet ;
- autre wallet autorisé.

### 17.3 `PhysicalCredentialProvider`

Pour :

- encodeur carte ;
- personalization bureau ;
- inventaire ;
- activation ;
- blocage.

### 17.4 `AccessControlProvider`

Pour :

- tourniquet ;
- serrure/gate ;
- contrôleur industriel ;
- système entreprise existant.

### 17.5 `IdentityEligibilityProvider`

Pour vérifier des statuts externes lorsque contractualisés :

- étudiant ;
- salarié ;
- bénéficiaire social ;
- accrédité événement.

Une absence d’intégration doit produire un statut explicite, pas un faux positif.

---

## 18. Feature flags et configuration

Prévoir des flags hiérarchiques par pays/organisation/réseau/produit :

- `pass.enabled`
- `pass.purchase.enabled`
- `pass.qr.enabled`
- `pass.dynamicQr.enabled`
- `pass.staticQr.enabled`
- `pass.nfc.enabled`
- `pass.physicalCard.enabled`
- `pass.appleWallet.enabled`
- `pass.googleWallet.enabled`
- `pass.subscription.enabled`
- `pass.autoRenew.enabled`
- `pass.transfer.enabled`
- `pass.refund.enabled`
- `control.enabled`
- `control.offline.enabled`
- `control.manualOverride.enabled`
- `control.photoCheck.enabled`
- `transit.tapOut.enabled`
- `transit.fareCapping.enabled`
- `transit.transferRules.enabled`
- `pass.subsidy.enabled`

Les flags doivent avoir :

- valeur ;
- scope ;
- auteur ;
- date d’effet ;
- date de fin facultative ;
- justification ;
- audit.

---

## 19. Sécurité applicative et équipement

### 19.1 Mobile utilisateur

- stockage sécurisé des tokens ;
- certificat pinning si stratégie globale retenue ;
- détection basique d’intégrité sans bloquer aveuglément les utilisateurs légitimes ;
- limitation screenshots uniquement si plateforme/cas d’usage le permet ;
- rotation des sessions ;
- authentification forte pour actions sensibles.

### 19.2 Appareil Control

- enrollment explicite ;
- clé appareil unique ;
- attestation si matériel compatible ;
- chiffrement local ;
- MDM possible pour flotte entreprise ;
- session contrôleur limitée ;
- wipe logique des secrets à révocation ;
- blocage à distance dès reconnexion ;
- détection de version obsolète ;
- politique de mise à jour minimale.

### 19.3 API

- OAuth/JWT selon architecture globale ;
- scopes ;
- mTLS pour certains équipements/partenaires si pertinent ;
- rate limiting ;
- WAF ;
- anti-replay ;
- idempotency ;
- secrets hors dépôt ;
- journalisation structurée ;
- correlation id.

### 19.4 Données personnelles

- minimisation ;
- chiffrement au repos/en transit ;
- séparation tenant ;
- masquage ;
- rétention configurable selon obligations ;
- export utilisateur lorsque applicable ;
- suppression/anonymisation lorsqu’autorisée ;
- conservation des preuves financières/audit selon obligations.

---

## 20. Fraude et abus

### 20.1 Risques principaux

- capture d’écran QR ;
- clonage de carte ;
- partage de pass nominatif ;
- replay offline ;
- appareil contrôleur compromis ;
- collusion contrôleur/usager ;
- dérogations abusives ;
- remboursement après consommation ;
- création frauduleuse de titre gratuit ;
- manipulation de tarif ;
- synchronisation falsifiée ;
- clock tampering ;
- double utilisation multi-appareils.

### 20.2 Signaux

- vélocité de scans ;
- géographie impossible ;
- même credential sur plusieurs appareils ;
- taux d’override par contrôleur ;
- horloge terminal incohérente ;
- validations après révocation connue ;
- nombreuses erreurs signature ;
- volume inhabituel de remplacements ;
- remboursements répétés ;
- appareil rooté/compromis selon signaux disponibles.

### 20.3 Décisions

Le moteur risque peut produire :

- `ALLOW` ;
- `ALLOW_WITH_WARNING` ;
- `STEP_UP` ;
- `REVIEW` ;
- `SUSPEND_PASS` ;
- `SUSPEND_DEVICE` ;
- `BLOCK`.

Toute décision automatisée sensible doit être explicable par codes de raisons et révisable selon politique.

---

## 21. Administration et back-office

### 21.1 Tableau de bord opérateur

Afficher :

- pass actifs ;
- ventes ;
- renouvellements ;
- validations ;
- taux de refus ;
- appareils actifs/offline ;
- incidents ;
- remboursements ;
- revenus ;
- commissions ;
- règlements ;
- écarts de réconciliation ;
- fraude.

### 21.2 Gestion produits

L’admin peut :

- créer brouillon ;
- dupliquer ;
- versionner ;
- simuler ;
- planifier publication ;
- retirer de la vente ;
- maintenir les pass déjà émis ;
- modifier règles futures sans altérer l’historique.

### 21.3 Gestion contrôleurs

- invitation ;
- affectation ;
- rôle ;
- mission ;
- activation ;
- suspension ;
- historique ;
- statistiques d’override ;
- appareils associés.

### 21.4 Gestion équipements

- inventaire ;
- provisioning ;
- firmware/app version ;
- dernier contact ;
- batterie si télémétrie ;
- statut réseau ;
- policy version ;
- certificat ;
- compromission ;
- remplacement.

### 21.5 Support

Le support doit pouvoir :

- rechercher un pass ;
- voir état et événements autorisés ;
- expliquer un refus ;
- lancer remplacement selon permission ;
- lancer demande de remboursement ;
- ne jamais modifier directement une écriture ledger.

---

## 22. Multi-pays et multi-devise

Le module doit isoler par pays :

- devise ;
- timezone ;
- règles fiscales ;
- conservation ;
- moyens de paiement ;
- opérateurs ;
- produits ;
- exigences KYC/éligibilité ;
- contrats ;
- langues ;
- règles de remboursement ;
- disponibilité Apple/Google Wallet ;
- politiques offline ;
- exigences d’accessibilité.

Les prix sont stockés dans leur devise d’origine avec précision décimale adaptée. Aucune conversion implicite ne doit être faite sans moteur de change explicite.

---

## 23. Notifications

Événements utilisateur :

- pass acheté ;
- pass émis ;
- abonnement bientôt expiré ;
- renouvellement réussi/échoué ;
- carte remplacée ;
- pass suspendu ;
- remboursement ;
- changement important de service ;
- justificatif à renouveler.

Événements opérateur :

- appareil offline trop longtemps ;
- hausse de refus ;
- replay massif ;
- clé à renouveler ;
- incident partenaire ;
- écart financier ;
- seuil de stock de cartes physiques.

Les notifications respectent préférences, consentements et données minimales.

---

## 24. Observabilité

### 24.1 Métriques

- latence scan → décision ;
- taux de décision locale ;
- taux offline ;
- profondeur file sync ;
- taux replay ;
- taux erreurs signature ;
- disponibilité API ;
- émission de pass ;
- succès paiement → émission ;
- taux renouvellement ;
- taux remboursement ;
- âge moyen des policy bundles ;
- appareils obsolètes ;
- écarts de règlement.

### 24.2 SLO cibles à valider

Hypothèses initiales à valider par environnement :

- validation locale QR/NFC : décision perceptible quasi instantanément, cible p95 < 300 ms sur terminal compatible ;
- API online de validation : cible p95 < 800 ms hors latence partenaire extrême ;
- disponibilité API critique : cible ≥ 99,9 % selon contrat ;
- aucune perte silencieuse d’événements offline ;
- émission idempotente malgré retry.

Ces valeurs sont des objectifs techniques et non des SLA contractuels tant qu’elles ne sont pas validées.

### 24.3 Logs et traces

- correlation id ;
- device id ;
- tenant id ;
- policy version ;
- event id ;
- pas de payload QR complet en logs ;
- pas de secret ;
- traces distribuées pour saga paiement/émission ;
- logs sensibles avec accès restreint.

---

## 25. Résilience

### 25.1 Défaillance partenaire paiement

- circuit breaker ;
- retry contrôlé ;
- pas de double débit ;
- état `PENDING` explicite ;
- récupération asynchrone.

### 25.2 Défaillance opérateur transport

- cache catalogue versionné ;
- émission suspendue si confirmation partenaire obligatoire ;
- contrôle des pass déjà émis selon politique offline ;
- reprise/réconciliation.

### 25.3 Défaillance Mansa backend

Le contrôle offline doit continuer selon policy bundle valide.

### 25.4 Perte terminal

- suspendre device ;
- révoquer certificat/session ;
- invalider bundles futurs ;
- analyser événements récents ;
- aucun secret serveur maître récupérable.

### 25.5 Reprise après incident

Prévoir :

- sauvegardes ;
- restauration testée ;
- RPO/RTO définis par criticité ;
- reconstruction des états depuis ledger/event log lorsque applicable ;
- procédure de rotation de clés d’urgence.

---

## 26. Tests

### 26.1 Tests unitaires

- machines d’état ;
- règles de validité ;
- calcul tarifaire ;
- commissions ;
- correspondances ;
- plafonds ;
- signature/vérification ;
- replay cache ;
- idempotency ;
- RBAC/ABAC.

### 26.2 Tests d’intégration

- paiement → émission ;
- émission → credential ;
- scan online ;
- scan offline ;
- sync batch ;
- révocation ;
- remboursement ;
- renouvellement ;
- connecteur opérateur mock ;
- wallet pass mock ;
- règlement.

### 26.3 Tests E2E

Scénarios minimum :

1. achat billet unitaire ;
2. QR dynamique valide ;
3. deuxième usage refusé ;
4. contrôle offline valide puis sync ;
5. double usage sur deux appareils offline ;
6. pass mensuel ;
7. abonnement renouvelé ;
8. paiement confirmé mais émission timeout puis récupération ;
9. pass révoqué ;
10. terminal compromis ;
11. carte physique remplacée ;
12. remboursement ;
13. étudiant éligible ;
14. changement tarif futur sans altération historique ;
15. commission Mansa/agent/partenaire répartie correctement.

### 26.4 Tests sécurité

- falsification QR ;
- replay ;
- changement horloge ;
- brute force API ;
- credential swapping ;
- privilege escalation ;
- tenant escape ;
- injection ;
- secret leakage ;
- device impersonation ;
- webhook spoofing ;
- signature downgrade ;
- revoked key acceptance.

### 26.5 Tests performance

- rafale de scans à l’entrée d’un stade ;
- heure de pointe transport ;
- synchronisation de milliers d’événements offline ;
- émission massive de cartes/pass ;
- renouvellements mensuels en lot ;
- diffusion de révocation urgente.

### 26.6 Chaos / résilience

- coupure réseau pendant scan ;
- API partenaire lente ;
- queue indisponible ;
- webhook dupliqué ;
- DB failover ;
- horloge terminal dérivée ;
- clé retirée ;
- policy bundle expiré.

---

## 27. Critères d’acceptation

Le module est considéré prêt pour une première phase intégrable lorsque :

1. un produit de pass peut être configuré sans code spécifique ;
2. un utilisateur éligible peut acquérir ou recevoir un pass ;
3. le paiement et l’émission sont idempotents ;
4. un QR signé peut être validé online et offline ;
5. une révocation est propagée de façon contrôlée ;
6. les doubles usages sont détectés et réconciliés ;
7. Mansa Control fonctionne avec un terminal mock puis un appareil Android cible ;
8. les contrôleurs ne voient que les données minimales ;
9. les droits sont isolés par tenant/organisation/réseau ;
10. un tarif et ses commissions peuvent être modifiés depuis l’administration sans changement de code ;
11. chaque transaction conserve son snapshot tarifaire historique ;
12. les commissions Mansa, opérateur, agent, commerçant, partenaire et apporteur sont séparables ;
13. les taxes sont séparées des commissions ;
14. le module supporte au moins deux devises au niveau architecture sans conversion implicite ;
15. les appareils peuvent accumuler et synchroniser des validations offline sans perte silencieuse ;
16. les secrets et clés privées ne sont pas dans le dépôt ;
17. les webhooks sont signés et idempotents ;
18. les actions sensibles sont auditées ;
19. les intégrations externes peuvent être remplacées par des mocks ;
20. aucune fonctionnalité partenaire n’est présentée comme disponible sans activation contractuelle.

---

## 28. Ordre de développement recommandé

### Phase A — Socle domaine

1. modèles `PassOrganization`, `PassIssuer`, `PassProduct`, `PassInstance` ;
2. machines d’état ;
3. RBAC/ABAC ;
4. audit ;
5. feature flags ;
6. pricing adapter central ;
7. ledger integration.

### Phase B — Émission numérique

1. catalogue ;
2. achat mock ;
3. émission ;
4. QR signé ;
5. application client ;
6. reçu ;
7. remboursement de base.

### Phase C — Mansa Control

1. enrollment appareil ;
2. sessions contrôleurs ;
3. scan QR ;
4. décision locale ;
5. synchronisation ;
6. révocation ;
7. replay detection.

### Phase D — Transport avancé

1. réseaux/lignes/arrêts/zones ;
2. billets/carnets/abonnements ;
3. correspondances ;
4. tap-in/tap-out ;
5. fare capping ;
6. réconciliation.

### Phase E — Supports et secteurs

1. NFC abstrait ;
2. cartes physiques ;
3. Apple Wallet/Google Wallet lorsque partenaires prêts ;
4. entreprise ;
5. école ;
6. événements ;
7. administration.

### Phase F — Industrialisation

1. multi-fournisseurs équipement ;
2. télémétrie ;
3. sécurité renforcée ;
4. fraude ;
5. reporting ;
6. settlement ;
7. tests charge/chaos ;
8. procédures opérationnelles.

---

## 29. Décisions de conception à conserver

- Mansa Pass est un moteur générique de titres et droits, pas uniquement un ticket de bus.
- Mansa Control doit continuer à fonctionner en réseau faible/hors ligne.
- Un QR doit être signé ; un simple identifiant n’est pas une preuve suffisante.
- Les cartes physiques Mansa Pass peuvent être non bancaires.
- L’usage Apple Wallet/Google Wallet est activé uniquement lorsque techniquement et contractuellement disponible.
- Le contrôleur n’a pas accès au wallet financier de l’utilisateur.
- Les équipements sont multi-fournisseurs derrière des adaptateurs.
- Les règles de contrôle et tarification sont versionnées.
- La tarification et les commissions sont modifiables depuis l’administration sans changement de code.
- Les frais historiques restent immuables après exécution.
- Les paiements, les droits d’accès et les événements de contrôle restent des domaines séparés mais réconciliables.
- Toute dépendance transport, banque, Mobile Money, wallet tiers, matériel ou administration reste abstraite jusqu’à contrat réel.

---

## 30. Hors périmètre initial

Ne pas bloquer l’architecture, mais ne pas promettre dès la première version :

- biométrie de masse au contrôle ;
- identité nationale officielle sans mandat ;
- NFC iPhone universel sans entitlement/contrat ;
- intégration directe à tous les réseaux de transport ;
- free-flow transport basé uniquement sur géolocalisation ;
- reconnaissance faciale automatique ;
- tarification dynamique opaque ;
- garanties SLA non contractées ;
- paiement bancaire EMV intégré dans une carte Pass non bancaire.

Ces capacités peuvent être étudiées plus tard via modules ou partenaires dédiés.

---

## 31. Résultat attendu

À terme, Mansa Pass & Control doit permettre à un opérateur ou une organisation de lancer un système de titre/accès moderne sans reconstruire toute la plateforme : création de produits, vente ou attribution, QR/NFC/carte, contrôle terrain, mode offline, abonnement, règles d’éligibilité, fraude, audit, reporting, settlement et tarification configurable.

Le même socle doit pouvoir desservir progressivement le transport, les établissements, les entreprises, les événements et les administrations tout en maintenant une isolation stricte des données et des règles par organisation et par pays.