# Conformité cartes — PCI DSS, données porteur et réduction de périmètre

## 1. Objet

Ce document définit les exigences Mansa relatives à la sécurité des paiements par carte, à la protection des données porteur et à la réduction du périmètre PCI DSS.

Il s'applique aux composants Mansa qui peuvent initier, transporter, traiter, journaliser ou administrer des paiements carte :

- application client ;
- application commerçant ;
- TPE et terminaux Android ;
- bornes de péage et automates ;
- checkout web ;
- liens de paiement ;
- API publiques et privées ;
- backend paiements ;
- portail administrateur ;
- portail État/concessionnaire lorsque des paiements carte sont activés ;
- services de rapprochement et reporting ;
- support et outils d'exploitation ;
- intégrations acquéreur, PSP, banque partenaire et réseaux carte.

L'objectif architectural est de réduire autant que possible la présence de données carte sensibles dans les systèmes Mansa et de confier la collecte cryptographique des données carte à des composants ou partenaires adaptés, certifiés lorsque requis.

Mansa ne doit jamais déclarer être « PCI DSS compliant » uniquement parce que ce document existe. La conformité réelle dépend de l'architecture effectivement déployée, des fournisseurs, de l'acquéreur, du périmètre, des contrôles techniques et organisationnels, des preuves et de l'évaluation applicable.

## 2. Principes impératifs

Les principes suivants sont obligatoires :

1. minimiser le périmètre PCI ;
2. éviter que le PAN complet transite dans le backend Mansa lorsque cela peut être évité ;
3. ne jamais stocker le CVV/CVC/CID après autorisation ;
4. ne jamais journaliser de données d'authentification sensibles ;
5. privilégier tokenisation, hosted fields, SDK de paiement ou terminal certifié ;
6. séparer les environnements et rôles ayant accès aux fonctions carte ;
7. chiffrer les données sensibles au repos et en transit lorsque leur traitement est réellement nécessaire ;
8. conserver des journaux d'audit sans y introduire de données carte interdites ;
9. limiter la conservation du PAN au strict besoin métier et réglementaire ;
10. rendre toutes les décisions de sécurité liées aux paiements auditables.

## 3. Données carte

Le système distingue au minimum :

```text
PAN
MASKED_PAN
CARDHOLDER_NAME
EXPIRY_MONTH
EXPIRY_YEAR
SERVICE_CODE
CVV_CVC_CID
PIN
PIN_BLOCK
TRACK_DATA
EMV_SENSITIVE_AUTH_DATA
PAYMENT_TOKEN
NETWORK_TOKEN
ACQUIRER_TOKEN
TRANSACTION_REFERENCE
AUTHORIZATION_CODE
```

Les catégories ne doivent pas être traitées de la même manière.

### 3.1 Données d'authentification sensibles

Les éléments suivants ne doivent pas être conservés après autorisation lorsqu'ils entrent dans les catégories interdites par les règles applicables :

- CVV/CVC/CID ;
- données piste complètes ;
- PIN ;
- PIN block ;
- données EMV sensibles assimilées à des données d'authentification.

Aucune fonction de debug, support, analytics, replay ou observabilité ne doit permettre leur stockage indirect.

### 3.2 PAN

Le PAN ne doit être stocké par Mansa que si un besoin explicite, documenté et approuvé le justifie.

Par défaut, Mansa conserve uniquement :

- token de paiement ;
- réseau ;
- type de carte si fourni ;
- pays émetteur si fourni ;
- derniers chiffres autorisés pour affichage ;
- référence transaction ;
- référence acquéreur/PSP ;
- statut ;
- horodatage.

L'affichage utilisateur ou support utilise un PAN masqué, par exemple :

```text
•••• •••• •••• 1234
```

Le nombre exact de chiffres visibles doit respecter les règles applicables du partenaire et du standard.

## 4. Architecture de réduction du périmètre

Architecture privilégiée :

```text
Utilisateur
→ terminal / hosted field / SDK PSP
→ acquéreur ou PSP
→ réseau carte
→ banque émettrice

Mansa
→ reçoit token + résultat + références de transaction
→ ne reçoit pas le PAN complet lorsque l'intégration le permet
```

Pour le web, privilégier :

- hosted fields ;
- iframe ou composant sécurisé fourni par le prestataire ;
- redirection de paiement ;
- tokenisation côté prestataire.

Pour mobile, privilégier :

- SDK officiel du PSP/acquéreur ;
- token de paiement retourné au backend ;
- aucune persistance locale du PAN/CVV.

Pour TPE et bornes, privilégier :

- lecteur/terminal EMV certifié ;
- chiffrement au point d'interaction lorsque disponible ;
- communication directe ou segmentée vers le processeur ;
- backend Mansa recevant uniquement l'état de la transaction et les références nécessaires.

## 5. Terminaux carte

Un terminal Mansa ou intégré à Mansa doit être traité comme un composant sensible.

Exigences :

- identifier fabricant, modèle, version logicielle et firmware ;
- enregistrer l'identifiant logique et physique du terminal ;
- rattacher le terminal à une organisation, un site et éventuellement une voie/caisse ;
- empêcher le changement silencieux de configuration acquéreur ;
- journaliser activation, suspension et révocation ;
- détecter un terminal non attendu ou remplacé ;
- maintenir un inventaire ;
- appliquer les mises à jour de sécurité selon procédure ;
- empêcher l'installation d'applications arbitraires sur les terminaux administrés ;
- vérifier l'intégrité lorsque le matériel/OS le permet ;
- ne jamais stocker PIN ou CVV dans l'application Mansa du terminal.

## 6. Réseaux et acquéreurs

Mansa doit accepter les réseaux carte activés par l'acquéreur et le contrat applicable.

L'interface ne doit pas promettre « toutes les cartes ».

Exemple de formulation :

```text
Cartes acceptées selon les réseaux activés par votre acquéreur.
Visa et Mastercard peuvent être supportés lorsqu'ils sont contractuellement disponibles.
```

Les capacités peuvent varier par :

- pays ;
- banque partenaire ;
- acquéreur ;
- terminal ;
- organisation ;
- site ;
- type de transaction ;
- carte domestique ou internationale ;
- carte de débit/crédit/prépayée ;
- transaction contact, sans-contact ou e-commerce.

## 7. Tokenisation

Le token est la représentation privilégiée d'une carte dans Mansa.

Entité recommandée :

```text
PaymentInstrumentToken
```

Champs minimaux :

- id interne ;
- userId/organizationId selon cas ;
- provider ;
- providerToken ;
- network ;
- maskedPan ;
- last4 ;
- expiryMonth si autorisé ;
- expiryYear si autorisé ;
- fingerprint fourni par le partenaire si applicable ;
- status ;
- createdAt ;
- revokedAt ;
- providerMetadata minimale.

Le token ne doit jamais être supposé non sensible simplement parce qu'il ne ressemble pas à un PAN. Son exposition peut permettre des transactions selon le fournisseur ; il doit donc être protégé par contrôle d'accès.

## 8. Carte enregistrée

Lorsqu'un utilisateur enregistre une carte :

1. Mansa initie une session de tokenisation ;
2. la saisie carte se fait via composant sécurisé du fournisseur ;
3. Mansa reçoit un token et des métadonnées limitées ;
4. le token est rattaché au compte ;
5. un consentement d'enregistrement est conservé ;
6. la carte peut être révoquée ;
7. aucune réaffichage du PAN complet n'est possible depuis Mansa.

Une carte enregistrée n'autorise pas implicitement toutes les opérations futures. Les règles de consentement, authentification et mandat restent applicables selon le canal.

## 9. Cartes Mansa

Si Mansa émet ou co-émet des cartes via une banque ou un processeur :

- les PAN sont générés et gérés par le processeur/émetteur approprié ;
- Mansa privilégie un identifiant/token de carte ;
- l'application n'expose le PAN complet que si la fonctionnalité est contractuellement prévue et techniquement sécurisée ;
- l'affichage éventuel exige une authentification forte/récente selon le risque ;
- le CVV dynamique ou statique n'est jamais écrit dans les logs ;
- les fonctions gel/dégel, remplacement et opposition sont auditables ;
- les clés EMV, PIN et secrets d'émission restent dans l'infrastructure dédiée du partenaire/HSM et non dans le code Mansa.

## 10. PIN

Mansa ne doit pas manipuler un PIN carte en clair.

Le PIN est saisi uniquement sur un composant prévu pour cette fonction :

- PIN pad ;
- terminal certifié ;
- composant sécurisé du partenaire.

Le backend Mansa ne doit jamais recevoir ni journaliser le PIN utilisateur d'une carte bancaire.

Le PIN d'authentification interne à une application Mansa est un mécanisme distinct et ne doit pas être confondu avec le PIN carte.

## 11. Logs et observabilité

Une politique de redaction centralisée est obligatoire.

Les logs doivent supprimer ou masquer :

- PAN complet ;
- CVV/CVC/CID ;
- PIN ;
- PIN block ;
- données piste ;
- payloads bruts susceptibles d'inclure ces données ;
- secrets d'API ;
- clés privées ;
- tokens d'authentification actifs.

Exemple acceptable :

```json
{
  "paymentId": "pay_...",
  "provider": "ACQUIRER_X",
  "network": "VISA",
  "last4": "1234",
  "status": "AUTHORIZED",
  "amount": 1000,
  "currency": "XOF"
}
```

Les outils APM, crash reporting, traces distribuées et replays doivent appliquer les mêmes règles.

## 12. APIs

Les APIs carte utilisent :

- TLS ;
- authentification forte service-to-service ;
- rotation des credentials ;
- timeouts ;
- idempotency keys ;
- protection replay ;
- validation stricte des schémas ;
- contrôle d'autorisation ;
- rate limiting ;
- audit.

Les webhooks acquéreur/PSP doivent :

- vérifier signature ou mécanisme d'authenticité du fournisseur ;
- vérifier timestamp/nonce lorsque disponible ;
- être idempotents ;
- dédupliquer les événements ;
- ne jamais faire confiance au montant ou statut provenant du client front-end ;
- récupérer l'état côté fournisseur lorsque nécessaire avant crédit définitif.

## 13. Idempotence et double débit

Toute création de paiement utilise une clé d'idempotence ou une référence métier unique.

Le système doit résister à :

- double clic ;
- retry mobile ;
- timeout réseau ;
- webhook dupliqué ;
- reprise après panne ;
- reconnexion d'une borne ;
- redémarrage de service ;
- message de queue retraité.

Une même intention ne doit pas provoquer plusieurs débits sans nouvelle autorisation métier explicite.

## 14. Segmentation réseau

Les composants carte doivent être isolés autant que possible du reste de la plateforme.

Zones recommandées :

```text
PUBLIC_EDGE
APP_SERVICES
PAYMENT_SERVICES
CARD_INTEGRATION_ZONE
ADMIN_ZONE
OBSERVABILITY_ZONE
DATA_ZONE
```

Les flux entre zones sont explicitement autorisés. Aucun accès général du réseau bureautique ou des postes développeur vers une zone sensible ne doit exister par défaut.

## 15. Environnements

Séparer strictement :

```text
LOCAL
DEVELOPMENT
TEST
STAGING
PRODUCTION
```

Les données de carte réelles ne doivent pas être utilisées en développement ou test.

Les environnements non production utilisent :

- cartes de test du fournisseur ;
- tokens de test ;
- données fictives ;
- sandbox acquéreur/PSP.

Un dump de production ne doit jamais être copié tel quel vers un environnement inférieur.

## 16. Secrets et clés

Les secrets de paiement sont gérés via le mécanisme central de secrets/KMS défini pour Mansa.

Interdictions :

- secret dans Git ;
- secret dans `.env.example` réel ;
- clé dans une image Docker ;
- secret dans une capture d'écran ou ticket ;
- secret partagé dans une conversation non prévue pour les secrets ;
- clé de production sur poste développeur sans procédure approuvée.

Les clés de chiffrement hautement sensibles sont placées dans HSM/KMS lorsque le niveau de risque ou le partenaire l'exige.

## 17. Accès administrateur

Les fonctions liées aux paiements carte sont protégées par RBAC et moindre privilège.

Exemples de permissions :

```text
payment.card.read_masked
payment.card.token.revoke
payment.transaction.read
payment.refund.request
payment.refund.approve
payment.provider.configure
payment.terminal.activate
payment.terminal.suspend
payment.audit.read
```

Les fonctions sensibles peuvent imposer :

- MFA ;
- authentification récente ;
- double validation ;
- séparation des tâches ;
- justification obligatoire ;
- seuils financiers.

## 18. Support client

Un agent support ne doit jamais demander à un client :

- son PIN carte ;
- son CVV complet ;
- une photo recto-verso non masquée de carte ;
- son mot de passe ;
- un code OTP de transaction destiné à être saisi par le client.

Les écrans support affichent seulement les informations nécessaires :

- last4 ;
- réseau ;
- statut ;
- date ;
- montant ;
- référence ;
- motif d'échec standardisé lorsqu'il peut être communiqué.

## 19. Remboursements

Un remboursement ne nécessite pas de ressaisir les données de carte.

Flux recommandé :

```text
transaction d'origine
→ référence provider/acquéreur
→ demande de remboursement
→ contrôles permissions/seuils
→ API partenaire
→ webhook/statut
→ ledger/rapprochement
→ reçu
```

Toute opération est idempotente et auditée.

## 20. Péages et bornes

Les deux solutions de péage de référence restent :

- A : péage automatique classique avec barrière ;
- B : télépéage RFID UHF avec barrière.

Une évolution ultérieure optionnelle vers du free-flow peut être ajoutée sans remplacer A ou B.

Le péage classique peut accepter selon les canaux activés :

- billets FCFA/XOF ;
- pièces FCFA/XOF ;
- carte bancaire EMV multi-réseaux selon l'acquéreur ;
- NFC ;
- carte Mansa ;
- wallet Mansa ;
- QR ;
- Mobile Money.

Mobile Money reste activable/désactivable par l'administration aux niveaux national, réseau, poste ou voie, avec date d'effet et audit.

Pour la carte :

- le terminal EMV est isolé du moteur espèces ;
- Mansa reçoit le résultat de paiement et les références nécessaires ;
- aucun PAN complet ne doit être exposé à l'interface opérateur ;
- une panne carte ne doit pas être présentée comme un refus client ;
- les autres moyens continuent si disponibles ;
- le mode local/hors ligne doit éviter tout double débit et resynchroniser proprement.

Le matériel reste multi-fournisseurs derrière des adaptateurs.

## 21. Multi-tenant

Toutes les entités paiement sont rattachées à leur tenant/organisation.

Un commerçant, agent, administration, concessionnaire ou entreprise ne peut consulter que les transactions autorisées dans son périmètre.

Les tokens de carte d'un utilisateur ou d'un tenant ne sont jamais accessibles à un autre tenant.

Les tests de sécurité doivent inclure des tentatives d'accès horizontal et vertical.

## 22. Détection fraude

Les contrôles carte alimentent le Risk Engine avec des signaux non sensibles :

- montant ;
- fréquence ;
- pays ;
- device ;
- réseau ;
- token/fingerprint pseudonymisé lorsque disponible ;
- échecs successifs ;
- vélocité ;
- nouvel appareil ;
- changement de comportement ;
- incohérences géographiques ;
- chargebacks/litiges.

Les règles antifraude ne justifient jamais la conservation du CVV, du PIN ou de données piste.

## 23. Fichiers, exports et rapports

Les exports standards ne contiennent pas de PAN complet.

Par défaut :

```text
transactionId
paymentId
amount
currency
network
last4
status
providerReference
createdAt
```

Un export exceptionnel contenant une donnée carte plus sensible exige une base légitime, une autorisation renforcée, chiffrement, durée de vie courte, journalisation et procédure de destruction.

## 24. Rétention et suppression

Chaque catégorie possède une durée de conservation définie.

Le moteur de gouvernance des données doit pouvoir :

- appliquer la rétention ;
- supprimer ou anonymiser les données expirées ;
- préserver les références financières nécessaires ;
- dissocier un token révoqué ;
- conserver les preuves d'audit sans conserver inutilement les données carte.

## 25. Fournisseurs et responsabilités

Pour chaque PSP, acquéreur, banque, gateway ou terminal :

- documenter le rôle ;
- documenter les responsabilités ;
- stocker la version contractuelle et technique ;
- vérifier les attestations/certifications applicables ;
- enregistrer les dates d'expiration ;
- prévoir un plan de remplacement ;
- identifier les sous-traitants critiques ;
- vérifier les notifications d'incident.

Entité recommandée :

```text
PaymentComplianceProvider
```

## 26. Inventaire du périmètre PCI

Maintenir un inventaire explicite :

```text
PCIAsset
PCIDataFlow
PCIService
PCIEndpoint
PCIProvider
PCIUserRole
PCIControl
PCIEvidence
PCIException
```

Chaque actif contient :

- propriétaire ;
- environnement ;
- justification d'inclusion ;
- type de donnée traité ;
- dépendances ;
- dernière revue ;
- statut ;
- plan de sortie du périmètre si possible.

## 27. Cartographie des flux

Une cartographie à jour doit montrer :

```text
point de saisie
→ terminal/SDK
→ réseau
→ fournisseur
→ callback/webhook
→ backend Mansa
→ ledger
→ reporting
```

Pour chaque flux :

- données présentes ;
- protocole ;
- chiffrement ;
- authentification ;
- source/destination ;
- environnement ;
- journalisation ;
- rétention.

## 28. Tests sécurité

Le programme de tests inclut :

- SAST ;
- détection secrets ;
- scan dépendances ;
- tests DAST en staging ;
- tests d'autorisation ;
- tests multi-tenant ;
- tests d'idempotence ;
- tests de webhook ;
- tests de redaction logs ;
- tests de configuration TLS ;
- tests de segmentation ;
- revue des terminaux ;
- tests de restauration/incident selon criticité.

La chaîne Mansa utilise notamment GitGuardian, Snyk, Semgrep et OWASP ZAP selon les workflows définis dans le dépôt.

## 29. Développement sécurisé

Les développeurs ne doivent jamais ajouter une fonction temporaire qui :

- affiche le PAN complet dans une console ;
- stocke un CVV pour faciliter les tests ;
- désactive la vérification de signature webhook ;
- ajoute un secret de production dans le code ;
- contourne la tokenisation ;
- désactive un contrôle de sécurité uniquement pour faire passer la CI.

Toute exception de sécurité doit être formellement documentée, datée, limitée dans le temps et approuvée.

## 30. Gestion des vulnérabilités

Les vulnérabilités sont classées et traitées selon le processus sécurité Mansa.

Pour les composants carte :

- critique : blocage déploiement et traitement prioritaire ;
- élevée : blocage sauf acceptation de risque formelle ;
- moyenne/faible : remédiation planifiée selon exposition.

Une dépendance non maintenue dans un chemin de paiement doit avoir un plan de remplacement.

## 31. Incident carte

En cas de suspicion d'exposition de données carte :

1. contenir l'incident ;
2. préserver les preuves ;
3. identifier le périmètre ;
4. révoquer/faire tourner les secrets ;
5. isoler les systèmes affectés ;
6. rechercher la présence de PAN/CVV/PIN dans logs, traces, backups et exports ;
7. notifier les responsables internes ;
8. appliquer les obligations contractuelles/réglementaires avec l'acquéreur, banque et partenaires ;
9. corriger ;
10. documenter le retour d'expérience.

Le SOC/SIEM Mansa doit disposer de scénarios de détection adaptés aux services de paiement.

## 32. Preuves de conformité

Mansa doit pouvoir produire des preuves :

- inventaire ;
- diagrammes de flux ;
- configurations ;
- résultats de scans ;
- revues d'accès ;
- journaux d'audit ;
- preuves de rotation de secrets ;
- preuves de patching ;
- procédures d'incident ;
- tests de segmentation ;
- attestations fournisseurs ;
- rapports de formation ;
- exceptions approuvées.

Les preuves sont stockées avec contrôle d'accès et durée de conservation définie.

## 33. Évaluation PCI

Le type exact d'évaluation dépend du rôle réel de Mansa et du modèle de déploiement.

Le projet doit déterminer avec la banque/acquéreur et un expert compétent lorsque nécessaire :

- statut de commerçant, prestataire ou autre rôle ;
- périmètre technique ;
- questionnaire ou évaluation applicable ;
- besoins de scans externes ;
- exigences de prestataire ;
- responsabilités partagées.

Le code ne doit pas embarquer une hypothèse figée sur le type de validation PCI.

## 34. Portail conformité

Un portail interne peut afficher :

```text
Conformité cartes
├── Périmètre PCI
├── Actifs
├── Flux de données
├── Fournisseurs
├── Terminaux
├── Contrôles
├── Vulnérabilités
├── Preuves
├── Exceptions
├── Revues d'accès
├── Incidents
└── Audits
```

Aucun écran de conformité ne doit exposer de données carte interdites.

## 35. Critères de recette

Le module est conforme à ce cahier des charges lorsque :

- le PAN complet n'est pas présent dans les logs ;
- le CVV/PIN/données piste ne sont jamais persistés ;
- les paiements utilisent tokenisation ou composants sécurisés lorsque prévu ;
- les webhooks sont authentifiés et idempotents ;
- les tokens sont isolés par utilisateur/tenant ;
- les environnements de test n'utilisent pas de vraies données carte ;
- les terminaux sont inventoriés ;
- les secrets sont hors Git ;
- les permissions sensibles sont auditées ;
- les flux carte sont cartographiés ;
- les fournisseurs ont des responsabilités documentées ;
- les scans et tests sécurité sont intégrés ;
- aucune affirmation de conformité PCI n'est faite sans évaluation correspondante.

## 36. Principe final

Mansa doit être conçu pour que les systèmes internes manipulent le moins possible les données carte brutes.

La règle de référence est :

```text
Collecter le minimum
→ tokeniser au plus tôt
→ isoler les composants sensibles
→ ne jamais conserver les données d'authentification interdites
→ contrôler les accès
→ auditer
→ réduire continuellement le périmètre PCI
```
