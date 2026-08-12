# 06 — Jini Voice complet

## 1. Objet et positionnement

Jini Voice est le module professionnel de téléphonie intelligente de Mansa. Il doit rester indépendant et réutilisable par la fintech Mansa, les entreprises, les indépendants, les administrations, les collectivités et les services publics. Ce n’est pas une application grand public d’appels entre particuliers.

Le principe commercial par défaut est BYOT (Bring Your Own Telephony) : chaque organisation cliente apporte et paie son numéro, son opérateur, son trunk SIP, son compte Twilio/CPaaS, son PBX ou son contrat télécom. Mansa/Jini ne supporte pas par défaut le coût téléphonique. Une option de téléphonie gérée pourra être proposée ultérieurement via partenaires, sans modifier le modèle cœur.

Objectifs principaux :
- répondre aux appels entrants selon la configuration de l’organisation ;
- accueillir en français et bambara, avec prise en charge du mélange français-bambara ;
- ajouter d’autres langues par pays via packs configurables ;
- transcrire, comprendre, router, prendre des messages et transférer vers un humain ;
- permettre des appels sortants autorisés et traçables ;
- connecter les appels à des Skills et workflows métier sans donner à l’IA un accès illimité ;
- fournir résumés, actions, notifications et analytics ;
- limiter strictement la conservation des contenus vocaux et permettre l’export avant suppression ;
- rester multi-tenant, multi-pays, multi-fournisseurs et auditable.

## 2. Principes d’architecture

Jini Voice est constitué de couches distinctes :

1. Telephony Adapter Layer : abstraction des fournisseurs téléphoniques.
2. Call Session Engine : cycle de vie d’un appel.
3. Speech Layer : STT, détection de langue, TTS, traduction si activée.
4. Conversation Orchestrator : gestion du dialogue et du contexte court terme.
5. Jini Skills Gateway : accès contrôlé aux capacités métier.
6. Workflow Engine : orchestration d’actions multi-étapes.
7. Jini Hub : registre de connecteurs et capacités disponibles par tenant.
8. Human Handoff : transfert, mise en attente, file, rappel, message.
9. Usage Metering : comptage téléphonie/IA/STT/TTS/traduction/stockage.
10. Audit & Compliance : journalisation des décisions sensibles.

Les fournisseurs sont derrière des interfaces abstraites afin d’éviter toute dépendance à un acteur unique : MOCK, SIP, PBX, OPERATOR, TWILIO/CPaaS, OTHER.

## 3. Multi-tenant

Chaque objet métier doit être rattaché à une `organizationId` et, lorsque pertinent, à un `workspaceId`, `siteId`, `countryCode` et `environment`.

Isolation obligatoire :
- aucun appel, transcript, configuration, secret, numéro ou workflow d’un tenant ne doit être visible par un autre ;
- chiffrement des secrets de connexion ;
- clés/identifiants fournisseurs jamais stockés en clair dans les logs ;
- séparation Test / Recette / Production ;
- limites et feature flags par organisation.

## 4. Modèles de données principaux

### Organization
- id
- name
- countryCode
- defaultTimezone
- defaultCurrency
- telephonyBillingMode : CUSTOMER_OWN_PROVIDER | JINI_OPTIONAL | THIRD_PARTY
- dataRetentionPolicyId
- status

### PhoneNumber
- id
- organizationId
- e164
- label
- inboundEnabled
- outboundEnabled
- connectionId
- callConfigurationId
- status

### TelephonyConnection
- id
- organizationId
- providerType : MOCK | SIP | OPERATOR | PBX | CPaaS | OTHER
- connectionMode : API | SIP_TRUNK | WEBHOOK | PBX | CALL_FORWARDING
- billingResponsibility : CUSTOMER | JINI_OPTIONAL | THIRD_PARTY
- encryptedCredentialsRef
- healthStatus
- capabilities
- status

### CallConfiguration
- id
- organizationId
- answeringMode : ALWAYS | AFTER_NO_ANSWER | OUTSIDE_BUSINESS_HOURS | WHEN_ALL_AGENTS_BUSY | MANUAL | DISABLED
- noAnswerDelaySeconds
- businessHoursPolicyId
- greetingId
- enabledLanguages
- autoLanguageDetection
- transcriptionEnabled
- liveTranslationEnabled
- recordingEnabled
- summaryEnabled
- messageTakingEnabled
- transferEnabled
- menuEnabled
- outboundAiEnabled
- retentionPolicyId

### SupportedLanguage
- code
- label
- countryScopes
- enabled
- sttProviderRef
- ttsProviderRef
- confidenceThreshold

Langues initiales : `fr`, `bm`, `en`. Le système doit accepter des packs supplémentaires sans refonte de schéma.

### Greeting
- id
- organizationId
- name
- languageSequence
- textByLanguage
- audioAssetRefs facultatifs
- activeFrom / activeUntil
- version

### Call
- id
- organizationId
- phoneNumberId
- providerCallId pseudonymisé ou tokenisé
- direction : INBOUND | OUTBOUND
- status : CREATED | RINGING | ANSWERED | AI_ACTIVE | HUMAN_ACTIVE | ON_HOLD | TRANSFERRING | COMPLETED | FAILED | CANCELLED
- startedAt
- answeredAt
- endedAt
- detectedLanguage
- mixedLanguageDetected
- disposition
- recordingRef nullable
- summaryRef nullable
- workflowRunId nullable

### CallParticipant
- id
- callId
- type : CALLER | AI | AGENT | EXTERNAL
- maskedIdentifier
- joinedAt
- leftAt

### TranscriptSegment
- id
- callId
- sequence
- speaker
- language
- text
- confidence
- startedAt
- endedAt
- redactionStatus
- expiresAt

### CallEvent
- id
- callId
- eventType
- timestamp
- payloadMinimized
- actorType

### UsageRecord
- id
- organizationId
- callId nullable
- metricType : TELEPHONY_SECONDS | STT_SECONDS | TTS_CHARS | AI_TOKENS | TRANSLATION_SECONDS | STORAGE_MB_DAY | WORKFLOW_ACTION
- quantity
- providerRef
- pricingSnapshotId
- occurredAt

### AuditLog
- id
- organizationId
- actorId / serviceId
- action
- resourceType
- resourceId
- beforeHash nullable
- afterHash nullable
- reason nullable
- timestamp
- correlationId

## 5. Parcours appel entrant

1. Le provider notifie Jini d’un appel entrant.
2. Le système résout le numéro appelé et l’organisation.
3. Vérification de la connexion, du statut, du pays et de la politique d’activation.
4. Évaluation de `answeringMode` et des horaires.
5. Si l’IA doit répondre, lecture de l’accueil configuré, par exemple français puis bambara.
6. Collecte de la première phrase.
7. Détection de langue et du mélange français-bambara.
8. Transcription temps réel si autorisée.
9. Classification d’intention.
10. Application des politiques : répondre, menu, prendre un message, transférer, appeler un Skill ou démarrer un workflow.
11. Confirmation explicite avant toute action sensible.
12. Exécution via Jini Skills Gateway.
13. Retour vocal à l’appelant.
14. Transfert humain si nécessaire.
15. Fin d’appel, disposition, résumé et usage metering.
16. Application automatique de la rétention et suppression à échéance.

## 6. Français-bambara et langues mixtes

Le moteur ne doit pas forcer une langue unique lorsque l’appelant mélange français et bambara. Le pipeline doit conserver les segments et permettre :
- détection segment par segment ;
- contexte conversationnel partagé ;
- réponse dans la langue dominante ou selon préférence déclarée ;
- bascule dynamique ;
- dictionnaires métier propres au tenant ;
- noms de produits, quartiers, services publics et expressions locales.

Le système doit exposer le niveau de confiance. Sous un seuil configurable, il demande une reformulation ou transfère vers un humain au lieu d’inventer.

## 7. Appels sortants

Les appels sortants IA sont désactivés par défaut. Ils sont activables par tenant, pays, numéro et use case.

Use cases autorisables :
- rappel demandé par un client ;
- confirmation de rendez-vous ;
- notification de commande ;
- rappel de dossier ;
- enquête de satisfaction ;
- relance autorisée par contrat et réglementation.

Exigences :
- source de consentement tracée ;
- plages horaires configurables ;
- fréquence maximale ;
- liste d’exclusion ;
- identification claire de l’organisation appelante ;
- opt-out ;
- pas d’appel automatique sensible sans base légitime ;
- aucune campagne massive hors politique locale.

## 8. Jini Skills Gateway

Un Skill est une capacité métier atomique et autorisée. Exemples :
- `merchant.createOrderDraft`
- `merchant.checkInventory`
- `calendar.createAppointment`
- `support.createTicket`
- `payments.getTransactionStatus`
- `cards.blockCard`
- `invoicing.createInvoiceDraft`

Un Skill déclare :
- nom et version ;
- tenant/country scopes ;
- permissions requises ;
- schéma d’entrée/sortie ;
- niveau de risque ;
- confirmation requise ou non ;
- données minimales nécessaires ;
- idempotency policy ;
- timeout ;
- retry policy ;
- audit policy.

L’IA ne peut jamais appeler directement une base de données ou une API interne sensible : elle passe par ce Gateway.

## 9. Workflow Engine

Le Workflow Engine permet des séquences contrôlées, par exemple :

`identifier client -> vérifier consentement -> vérifier disponibilité -> créer brouillon commande -> lire récapitulatif -> obtenir confirmation -> confirmer commande -> envoyer notification`.

Chaque workflow possède :
- version ;
- déclencheur ;
- étapes ;
- conditions ;
- timeouts ;
- compensations ;
- niveau de risque ;
- permissions ;
- journal d’exécution ;
- état : DRAFT | ACTIVE | PAUSED | ARCHIVED.

Aucune étape irréversible ne doit être exécutée deux fois : usage obligatoire de clés d’idempotence.

## 10. Jini Hub

Jini Hub est le registre des connecteurs disponibles. Il ne contient pas de secrets en clair. Il expose :
- connecteurs installés par tenant ;
- scopes ;
- santé ;
- environnements ;
- capacités ;
- versions ;
- quotas ;
- date d’expiration d’autorisation ;
- bouton de révocation.

Connecteurs possibles : Mansa Commerce, Mansa Client, CRM, ERP, agenda, support, annuaire, services publics, transport, partenaires externes.

## 11. Human Handoff

Modes :
- transfert immédiat ;
- transfert après qualification ;
- file d’attente ;
- rappel ;
- prise de message ;
- transfert vers équipe/compétence/site.

Avant transfert, l’agent humain peut recevoir un résumé court et les informations minimales nécessaires. Le transcript complet n’est montré que si la politique et les permissions l’autorisent.

Fallbacks :
- si tous les agents sont occupés, proposer message ou rappel ;
- si transfert échoue, revenir au dialogue IA ou enregistrer une demande ;
- aucun appel ne doit être abandonné silencieusement.

## 12. Enregistrement, transcription, résumé et rétention

Par défaut, la conservation doit être minimale.

Politiques distinctes pour :
- audio ;
- transcripts ;
- résumés ;
- métadonnées ;
- logs techniques.

L’organisation peut définir une durée plus courte lorsque légalement possible. La plateforme doit supporter :
- suppression automatique ;
- legal hold uniquement sur base autorisée ;
- export par l’organisation avant suppression ;
- export vers le stockage du client ;
- preuve de suppression ;
- redaction des données sensibles ;
- séparation audio / texte / métadonnées.

L’audio n’est jamais enregistré si `recordingEnabled=false`, sauf obligation explicite documentée et configurée par la politique locale.

## 13. Sécurité et confidentialité

- chiffrement en transit et au repos ;
- rotation des secrets ;
- mTLS/SIP-TLS/SRTP lorsque le fournisseur le supporte ;
- signatures de webhooks ;
- anti-replay ;
- allowlists réseau si disponibles ;
- tokenisation des numéros dans les logs ;
- redaction PAN, PIN, CVV, mots de passe, OTP et secrets ;
- l’IA ne doit jamais demander un PIN complet ou un CVV ;
- séparation stricte des environnements ;
- audit des accès administratifs ;
- export des données journalisé ;
- moindre privilège.

## 14. RBAC / ABAC

Rôles de référence :
- SUPER_ADMIN_MANSA
- JINI_PLATFORM_ADMIN
- ORG_OWNER
- ORG_TELEPHONY_ADMIN
- ORG_AI_ADMIN
- ORG_SUPERVISOR
- ORG_AGENT
- ORG_ANALYST
- AUDITOR
- SUPPORT_RESTRICTED

Exemples de permissions :
- `jini.phone_numbers.read/write`
- `jini.connections.read/write`
- `jini.greetings.manage`
- `jini.workflows.manage`
- `jini.skills.assign`
- `jini.calls.read`
- `jini.transcripts.read`
- `jini.recordings.read`
- `jini.retention.manage`
- `jini.pricing.read`
- `jini.outbound.manage`

ABAC : organisation, pays, site, équipe, environnement, classification de données, niveau de risque.

## 15. Feature flags

Flags minimaux :
- jini_voice_enabled
- inbound_ai_enabled
- outbound_ai_enabled
- fr_enabled
- bm_enabled
- mixed_fr_bm_enabled
- en_enabled
- auto_language_detection_enabled
- transcription_enabled
- live_translation_enabled
- recording_enabled
- summary_enabled
- menu_enabled
- human_transfer_enabled
- message_taking_enabled
- skills_enabled
- workflow_engine_enabled
- customer_export_enabled

Les flags sont évaluables au niveau global, pays, tenant, numéro, environnement.

## 16. API et webhooks

### API principales
- `POST /v1/jini/telephony/connections`
- `GET /v1/jini/telephony/connections/:id`
- `POST /v1/jini/phone-numbers`
- `PATCH /v1/jini/phone-numbers/:id`
- `PUT /v1/jini/call-configurations/:id`
- `POST /v1/jini/greetings`
- `GET /v1/jini/calls`
- `GET /v1/jini/calls/:id`
- `POST /v1/jini/calls/:id/transfer`
- `POST /v1/jini/calls/:id/end`
- `POST /v1/jini/outbound-calls`
- `GET /v1/jini/usage`
- `POST /v1/jini/exports`
- `POST /v1/jini/workflows`
- `POST /v1/jini/skills/:skillId/assign`

Toutes les mutations sensibles supportent `Idempotency-Key` et `correlationId`.

### Webhooks sortants
- call.created
- call.answered
- call.completed
- call.failed
- call.message_taken
- call.transfer_requested
- call.transfer_completed
- call.transfer_failed
- language.detected
- transcript.ready
- summary.ready
- workflow.started
- workflow.completed
- workflow.failed
- usage.threshold_reached

Signatures obligatoires et rotation des secrets.

## 17. Pricing & Commission Engine

Jini Voice consomme le moteur central de tarification Mansa. Aucun tarif ne doit être codé en dur.

Dimensions tarifaires configurables :
- pays ;
- devise ;
- tenant ;
- offre ;
- canal ;
- provider ;
- inbound/outbound ;
- durée ;
- feature IA ;
- volume ;
- environnement ;
- partenaire.

Types de frais :
- abonnement logiciel ;
- prix fixe par appel ;
- prix par minute ou seconde ;
- STT ;
- TTS ;
- traduction ;
- résumé ;
- stockage ;
- exécution de Skill/workflow ;
- support premium ;
- frais partenaire ;
- taxes.

Le moteur doit supporter fixe, %, fixe + %, minimum, maximum, paliers, gratuité, quotas gratuits, promotions, date d’effet, date de fin et règles par volume.

Répartition possible : Mansa, opérateur/CPaaS, intégrateur, apporteur, partenaire technique, taxes. La responsabilité du coût téléphonique reste `CUSTOMER` par défaut en BYOT.

Chaque `UsageRecord` référence un `pricingSnapshotId` immuable. Toute modification tarifaire passe par : DRAFT -> SIMULATED -> APPROVED -> SCHEDULED -> ACTIVE -> RETIRED. Les changements sensibles exigent approbation et audit.

## 18. Usage metering et limites

Mesures :
- secondes d’appel ;
- secondes STT ;
- caractères TTS ;
- tokens IA ;
- secondes de traduction ;
- stockage ;
- actions Skill ;
- workflows ;
- transferts.

Quotas et alertes configurables : budget quotidien/mensuel, plafond d’appels sortants, plafond de minutes, seuil de coût, suspension automatique facultative.

## 19. Fraude et abus

Détections :
- explosion anormale de volume ;
- appels sortants répétitifs ;
- destination inhabituelle ;
- boucle de transfert ;
- tentative de contournement d’authentification ;
- extraction massive de données via conversation ;
- appels très longs atypiques ;
- utilisation d’un Skill sensible hors contexte.

Actions : alerte, rate limit, blocage temporaire, désactivation d’un numéro, suspension outbound, exigence d’approbation humaine.

## 20. Authentification de l’appelant pour actions sensibles

La reconnaissance du numéro n’est pas une authentification suffisante.

Pour les actions sensibles, utiliser selon contexte :
- challenge dans l’application Mansa ;
- code à usage unique envoyé sur canal approuvé ;
- question contextuelle non secrète ;
- validation humaine ;
- authentification existante de session.

Exemples nécessitant confirmation forte : blocage carte, changement de données, paiement, ordre financier, divulgation de données confidentielles.

## 21. Réseau faible et résilience

La signalisation téléphonique peut dépendre du fournisseur, mais Jini doit dégrader proprement :
- fallback vers message vocal ou humain ;
- files persistantes pour webhooks ;
- reprise des événements ;
- idempotence ;
- retry exponentiel ;
- circuit breakers ;
- cache court de configuration ;
- aucun double traitement d’action métier.

En cas de perte du moteur IA, la plateforme peut lire un message statique et transférer/prendre un message selon politique.

## 22. Observabilité

KPIs :
- appels entrants/sortants ;
- taux de décrochage ;
- durée ;
- résolution IA ;
- transfert humain ;
- taux d’échec ;
- langue ;
- coût par appel ;
- coût IA ;
- usage par tenant ;
- latence STT/TTS/LLM ;
- taux de fallback ;
- succès workflow ;
- satisfaction lorsqu’elle est collectée.

Aucun dashboard ne doit exposer des transcripts par défaut aux rôles analytics.

## 23. Administration

Le portail admin doit permettre :
- connecter un provider ;
- associer les numéros ;
- tester la santé ;
- régler horaires et modes de décrochage ;
- configurer accueils et langues ;
- activer/désactiver chaque feature ;
- configurer transfert et files ;
- assigner Skills/workflows ;
- gérer rétention ;
- gérer outbound ;
- consulter usage/coûts ;
- simuler tarifs ;
- définir quotas ;
- consulter audits ;
- exporter données ;
- révoquer un connecteur.

## 24. Tests fonctionnels

Scénarios minimaux :
1. appel entrant FR ;
2. appel entrant BM ;
3. mélange FR/BM ;
4. faible confiance langue ;
5. hors horaires ;
6. agents tous occupés ;
7. transfert réussi ;
8. transfert échoué ;
9. prise de message ;
10. Skill lecture seule ;
11. Skill sensible avec confirmation ;
12. retry idempotent ;
13. appel sortant sans consentement -> refus ;
14. appel sortant autorisé ;
15. recording désactivé ;
16. suppression automatique à échéance ;
17. export avant suppression ;
18. changement tarifaire sans impact rétroactif ;
19. panne STT ;
20. panne LLM ;
21. panne provider ;
22. isolation multi-tenant.

## 25. Tests sécurité

- signatures webhook invalides ;
- replay webhook ;
- injection de prompt visant un Skill sensible ;
- tentative d’accès cross-tenant ;
- exfiltration de secrets ;
- contournement RBAC/ABAC ;
- IDOR ;
- rate-limit ;
- redaction PAN/PIN/CVV/OTP ;
- permissions transcript/recording ;
- export non autorisé ;
- rotation de secret provider.

## 26. Performance et SLO indicatifs

Objectifs techniques à valider par environnement :
- prise en charge événement entrant < 500 ms hors latence provider ;
- premier retour vocal suffisamment rapide pour une conversation naturelle ;
- traitement streaming sans blocage global ;
- services horizontalement scalables ;
- aucune session d’appel stockée uniquement en mémoire locale ;
- backpressure sur flux STT/TTS ;
- dégradation contrôlée si un fournisseur atteint ses quotas.

## 27. Ordre de développement

Phase 1 — Fondations : multi-tenant, PhoneNumber, TelephonyConnection, CallConfiguration, MockTelephonyProvider, appels entrants, greeting FR/BM, détection langue, transcript, routing, audit, usage.

Phase 2 — Humain : transferts, files, message, horaires, présence agents, notifications.

Phase 3 — IA métier : Jini Skills Gateway, premiers Skills lecture seule, confirmation, Workflow Engine.

Phase 4 — Jini Hub : connecteurs, scopes, health, révocation, environnements.

Phase 5 — Appels sortants : consentement, quotas, campagnes unitaires autorisées, callbacks.

Phase 6 — Industrialisation : providers réels, résilience, analytics, pricing, sécurité renforcée, multi-pays, langues supplémentaires.

## 28. Critères d’acceptation

Le module est considéré prêt pour intégration lorsque :
- deux tenants peuvent recevoir des appels sans aucune fuite croisée ;
- le fournisseur téléphonique est remplaçable via adapter ;
- le mode BYOT est le défaut et Mansa n’est pas automatiquement payeur de la téléphonie ;
- FR, BM et mélange FR/BM sont gérés ;
- transcription, traduction, enregistrement et résumé sont activables séparément ;
- un appel peut être transféré ou converti en message ;
- un Skill sensible ne peut être exécuté sans permissions et confirmation requise ;
- les workflows sont versionnés et idempotents ;
- les données expirent selon la politique de rétention et sont exportables avant suppression ;
- les tarifs et commissions sont entièrement configurables sans changement de code ;
- un changement de tarif n’altère jamais l’historique des appels précédents ;
- les webhooks sont signés ;
- les principaux fallbacks sont testés ;
- l’administration dispose d’audit, quotas, feature flags et observabilité ;
- aucun secret réel ou identifiant partenaire n’est versionné dans le dépôt.

## 29. Hypothèses à valider

- disponibilité et qualité réelle STT/TTS bambara selon les fournisseurs sélectionnés ;
- modalités réglementaires d’enregistrement d’appel pays par pays ;
- obligations de conservation ou consentement spécifiques ;
- fournisseurs télécom et CPaaS retenus ;
- disponibilité du SIP trunking chez les opérateurs ciblés ;
- conditions contractuelles de transfert et présentation du numéro ;
- langues additionnelles prioritaires pour l’expansion Afrique de l’Ouest.

Toute hypothèse non validée doit rester configurable et ne doit pas être présentée comme une capacité contractuellement disponible.