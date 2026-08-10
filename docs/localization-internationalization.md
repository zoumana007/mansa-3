# Cahier des charges — Localisation, internationalisation, langues et contenus multilingues

## 1. Objet

Ce document définit les exigences Mansa relatives à l’internationalisation (`i18n`), la localisation (`l10n`), la gestion des langues, des traductions, des formats régionaux et des contenus multilingues pour l’ensemble de l’écosystème Mansa.

Le domaine couvre les applications client, commerçant, TPE, Admin Lite, portails web, portail État, annuaire, site vitrine, Jini, Jini Voice, bornes de péage, équipements de mobilité, reçus, factures, notifications, e-mails, SMS, documents, interfaces partenaires et outils internes.

L’objectif est que Mansa puisse fonctionner au Mali puis dans plusieurs pays sans dupliquer le produit ni coder une version différente par pays.

La langue, la devise, les formats de date, les formats numériques, les textes réglementaires, les contenus d’aide et les variantes d’interface doivent être pilotés par configuration et versionnés.

## 2. Principes directeurs

Mansa doit appliquer les principes suivants :

1. aucune chaîne utilisateur importante ne doit être codée en dur dans les interfaces finales ;
2. les traductions doivent être centralisées, versionnées et auditables ;
3. chaque langue possède un code stable et une politique de fallback ;
4. les langues visibles peuvent varier selon le pays, l’organisation, le produit, le canal ou l’équipement ;
5. le français, le bamanankan et l’anglais constituent le socle initial pour le Mali lorsque le produit concerné les active ;
6. des langues supplémentaires doivent pouvoir être ajoutées sans modifier l’architecture ;
7. les contenus réglementaires ou contractuels doivent être versionnés séparément des simples libellés d’interface ;
8. une traduction manquante ne doit jamais afficher une clé technique brute à un utilisateur final ;
9. la langue d’affichage et la langue vocale peuvent être distinctes ;
10. les formats locaux doivent être pilotés par locale et non par concaténation manuelle ;
11. les montants doivent toujours conserver la valeur comptable originale et ne localiser que leur présentation ;
12. les contenus critiques doivent être soumis à validation humaine avant publication ;
13. la traduction automatique peut assister le processus mais ne doit pas publier seule des contenus juridiques, financiers ou de sécurité ;
14. l’accessibilité et la lisibilité doivent rester valides après traduction ;
15. le système doit supporter des textes plus longs que le français sans casser les interfaces.

## 3. Concepts

Le système distingue :

```text
Language
Locale
Country
Currency
TranslationKey
TranslationValue
ContentVariant
LegalContentVersion
VoiceLocale
FormattingProfile
```

Exemples :

```text
Language: fr
Locale: fr-ML
Country: ML
Currency: XOF

Language: bm
Locale: bm-ML
Country: ML
Currency: XOF

Language: en
Locale: en-GB ou en-US selon configuration produit
```

La langue décrit principalement la langue du contenu.

La locale décrit la combinaison langue + conventions régionales utilisée pour l’affichage.

## 4. Langues initiales Mali

Pour les produits grand public et les équipements nécessitant une interaction large avec la population malienne, Mansa doit pouvoir activer au minimum :

```text
fr = Français
bm = Bamanankan / Bambara
 en = English
```

Le nom visible de la langue doit être configurable et peut être affiché sous sa forme native.

Exemple :

```text
Français
Bamanankan
English
```

Le produit ne doit pas supposer que toutes les langues sont actives sur tous les écrans.

Une administration, entreprise ou exploitant peut choisir un sous-ensemble ou ajouter des langues autorisées.

## 5. Ajout de langues futures

Le modèle doit permettre d’ajouter sans refonte :

- arabe ;
- espagnol ;
- portugais ;
- wolof ;
- peul / fulfulde selon politique locale ;
- soninké ;
- songhaï ;
- dioula ;
- langues spécifiques aux futurs pays de déploiement.

L’ajout d’une langue doit suivre un workflow contrôlé et ne pas nécessiter de modifier les tables métier principales.

## 6. Modèle de données recommandé

Entités minimales :

```text
Language
Locale
TranslationNamespace
TranslationKey
TranslationValue
TranslationRelease
ContentDocument
ContentDocumentVersion
ContentTranslation
OrganizationLanguagePolicy
ProductLanguagePolicy
CountryLanguagePolicy
DeviceLanguagePolicy
UserLanguagePreference
VoiceLanguagePolicy
TranslationAuditLog
```

## 7. Entité Language

Champs recommandés :

```text
id
code
name
nativeName
script
textDirection
status
isVoiceSupported
isMachineTranslationAllowed
createdAt
updatedAt
```

Valeurs `status` :

```text
DRAFT
ACTIVE
DEPRECATED
DISABLED
```

Valeurs `textDirection` :

```text
LTR
RTL
```

Le support RTL doit être prévu dès l’architecture même s’il n’est pas prioritaire au lancement.

## 8. Entité Locale

Champs :

```text
id
code
languageCode
countryCode
numberFormat
dateFormat
timeFormat
currencyDisplayStyle
firstDayOfWeek
measurementSystem
status
```

La locale ne doit jamais modifier la valeur métier stockée.

## 9. Namespaces de traduction

Les clés doivent être regroupées par domaine.

Exemples :

```text
common
identity
payments
wallet
cards
merchant
agents
state
tolls
mobility
support
notifications
jini
jini_voice
kyc
risk
errors
legal
```

Une clé doit rester stable même si son texte visible change.

Exemple :

```text
tolls.payment.amount_due
```

et non :

```text
Montant_a_payer
```

## 10. Clés de traduction

Chaque `TranslationKey` doit définir :

```text
key
namespace
description
context
contentType
criticality
maxLengthHint
supportsPluralization
supportsVariables
status
```

La description doit indiquer le contexte afin d’éviter les traductions ambiguës.

## 11. Valeurs traduites

Chaque `TranslationValue` doit inclure :

```text
translationKeyId
languageCode
localeCode?
value
status
source
version
reviewedBy
reviewedAt
publishedAt
```

Sources possibles :

```text
HUMAN
MACHINE_ASSISTED
MACHINE_GENERATED
PARTNER
REGULATORY_SOURCE
```

Statuts :

```text
DRAFT
IN_REVIEW
APPROVED
PUBLISHED
REJECTED
ARCHIVED
```

## 12. Fallback

Le système doit avoir une politique de fallback déterministe.

Exemple Mali :

```text
bm-ML -> bm -> fr-ML -> fr -> fallback produit
```

ou selon configuration :

```text
en-ML -> en -> fr -> fallback produit
```

Un contenu critique manquant doit pouvoir empêcher la publication plutôt que tomber silencieusement sur une langue non autorisée.

## 13. Sélection de langue utilisateur

L’ordre de résolution recommandé est :

1. préférence explicite de l’utilisateur ;
2. préférence de session ;
3. préférence du profil ;
4. politique du produit / organisation ;
5. locale système du terminal lorsque autorisée ;
6. langue par défaut du pays ;
7. fallback global.

La préférence utilisateur doit être persistante lorsqu’elle est liée à un compte.

## 14. Utilisateur non authentifié

Avant connexion, la langue peut provenir :

- de la dernière langue locale enregistrée ;
- du système d’exploitation ;
- du navigateur ;
- du pays détecté/configuré ;
- d’un choix explicite sur l’écran d’accueil.

Aucune détection automatique ne doit empêcher un changement manuel.

## 15. Politique par organisation

Une organisation peut configurer :

```text
defaultLanguage
allowedLanguages
requiredLanguages
fallbackLanguage
showLanguageSelector
allowUserOverride
```

Une administration nationale peut imposer certaines langues sur des services publics.

## 16. Bornes de péage et équipements publics

Les bornes doivent intégrer un sélecteur de langue minimal lorsque l’écran est interactif.

Pour le Mali, configuration recommandée initiale :

```text
FR | BM | EN
```

La borne peut afficher d’autres langues si l’exploitant les active.

La sélection doit être visible, simple et utilisable sans parcourir un menu complexe.

La langue peut revenir automatiquement à la langue par défaut après la fin d’une transaction ou un délai d’inactivité.

## 17. Péages — exigences de référence

Les décisions fonctionnelles du domaine péage restent inchangées et coexistent avec le moteur de localisation.

Deux solutions initiales doivent coexister :

```text
A. péage automatique classique avec barrière
B. télépéage RFID UHF avec barrière
```

Une évolution future optionnelle vers du free-flow sans barrière peut être ajoutée sans remplacer A ni B.

Le péage classique peut accepter selon configuration :

- billets FCFA ;
- pièces FCFA ;
- carte bancaire EMV et réseaux activés par l’acquéreur, notamment Visa et Mastercard lorsqu’ils sont contractuellement disponibles ;
- NFC ;
- carte Mansa ;
- wallet Mansa ;
- QR ;
- Mobile Money.

Mobile Money reste activable/désactivable aux niveaux :

```text
NATIONAL
NETWORK
TOLL_PLAZA
LANE
```

avec date d’effet, auteur et audit.

La localisation ne doit jamais supprimer automatiquement un canal de paiement.

## 18. Péages — textes physiques et écran

Les libellés suivants doivent être localisables :

```text
Montant à payer
Carte / Sans contact
Insérez vos billets
Insérez vos pièces
Scannez votre QR
Récupérez votre monnaie
Récupérez votre reçu
Paiement accepté
Paiement refusé
Abonnement reconnu
Passage autorisé
Service indisponible
Utilisez une autre voie
Assistance
```

Les textes imprimés directement sur la façade physique doivent être conçus avec pictogrammes universels et éventuellement plusieurs langues courtes.

L’écran peut afficher la langue complète choisie par l’usager.

## 19. Marque blanche des bornes

Les contenus doivent être indépendants de la marque.

Une borne peut afficher :

- République du Mali ;
- ministère ou agence publique ;
- concessionnaire ;
- entreprise ;
- parking ;
- opérateur privé.

La mention `Propulsé par Mansa` reste facultative selon la politique de marque blanche.

Les traductions doivent appartenir au contenu fonctionnel, pas au logo de Mansa.

## 20. Télépéage RFID et ANPR

Le télépéage initial utilise :

- tags UHF RFID passifs ;
- véhicule associé ;
- compte ou abonnement associé ;
- lecteur/antenne ;
- contrôleur local ;
- relais `OPEN` ;
- barrière ;
- capteurs de passage.

Les statuts affichés doivent être localisés, par exemple :

```text
ABONNEMENT RECONNU
ABONNEMENT EXPIRÉ
VÉHICULE NON RECONNU
PASSAGE AUTORISÉ
ASSISTANCE REQUISE
```

Le conducteur ne doit pas sélectionner manuellement « RFID » comme moyen de paiement lorsque la reconnaissance est automatique.

## 21. Péages hors ligne

Le contrôleur local doit embarquer les traductions nécessaires au fonctionnement hors ligne.

Le cache local doit inclure :

```text
activeTranslationRelease
fallbackLanguage
criticalMessages
paymentLabels
errorMessages
assistanceMessages
```

Une perte de réseau ne doit pas faire disparaître les traductions ni afficher des clés techniques.

La resynchronisation des contenus doit être versionnée.

## 22. Anti-corruption — messages et audit

La langue ne doit jamais modifier la logique d’audit.

Les événements internes conservent des codes stables :

```text
MANUAL_BARRIER_OPEN
PAYMENT_ACCEPTED
VEHICLE_DETECTED
PASSAGE_DETECTED
```

L’interface traduit uniquement leur libellé.

Le système continue à rapprocher :

```text
véhicule détecté
-> catégorie
-> tarif attendu
-> paiement
-> ouverture de barrière
-> passage physique
```

Toute ouverture manuelle reste auditée indépendamment de la langue de l’agent.

## 23. Jini Voice

Jini Voice doit séparer :

```text
greetingLanguages
languageDetectionLanguages
transcriptionLanguages
translationLanguages
ttsLanguages
agentDisplayLanguage
```

Pour le lancement Mali, détection et accueil doivent pouvoir prendre en charge :

```text
fr
bm
en
```

selon capacités du fournisseur sélectionné.

## 24. Accueil bilingue Jini Voice

Une organisation peut configurer un accueil séquentiel.

Exemple logique :

```text
FR puis BM
BM puis FR
FR uniquement
BM uniquement
EN uniquement
```

La configuration ne doit pas être codée en dur.

## 25. Détection automatique de langue

Le détecteur doit retourner au minimum :

```text
languageCode
confidence
alternatives
```

En cas de faible confiance, le système peut demander une clarification localisée.

Exemple fonctionnel :

```text
Souhaitez-vous continuer en français ou en bamanankan ?
```

## 26. Texte + voix

Une phrase affichée et une phrase prononcée peuvent avoir des variantes différentes.

Exemple :

```text
DISPLAY_SHORT
VOICE_NATURAL
SMS_SHORT
EMAIL_LONG
```

Le moteur de contenu doit supporter ces variantes.

## 27. Notifications

Les notifications push, SMS, e-mail et in-app doivent utiliser la langue du destinataire ou la politique du canal.

Une notification doit conserver :

```text
templateId
templateVersion
languageCode
renderedContentHash
sentAt
```

Cela permet de reproduire ce qui a été envoyé sans conserver inutilement tous les contenus sensibles en clair.

## 28. Messages transactionnels critiques

Pour :

- paiement accepté/refusé ;
- retrait ;
- transfert ;
- changement de sécurité ;
- KYC ;
- litige ;
- carte bloquée ;
- fraude ;
- administration publique ;

les traductions doivent être validées avant publication.

Un texte ambigu sur un montant, un délai ou une action irréversible est interdit.

## 29. Variables dans les traductions

Le moteur doit supporter des variables typées.

Exemple :

```text
payment.success = "Paiement de {amount} effectué"
```

`amount` doit être rendu par un formateur monétaire et non concaténé comme simple chaîne.

Variables recommandées :

```text
amount
currency
merchantName
firstName
reference
expiryDate
count
country
```

## 30. Protection contre l’injection

Les variables utilisateur insérées dans une traduction doivent être échappées selon le canal.

Interdictions :

- HTML arbitraire provenant d’un utilisateur ;
- Markdown non filtré dans un canal sensible ;
- formatage dynamique non contrôlé ;
- traduction contenant du code exécutable.

## 31. Pluriels

Le système doit utiliser des règles de pluriel par langue.

Il ne faut pas implémenter uniquement :

```text
count == 1 ? singular : plural
```

Les règles doivent être déléguées à une bibliothèque i18n mature ou au standard ICU MessageFormat équivalent.

## 32. Genres et variantes grammaticales

Lorsque nécessaire, les traductions peuvent utiliser des variantes grammaticales sans exposer inutilement des données personnelles.

L’usage du genre doit être limité aux cas où il apporte une réelle valeur UX.

## 33. Format des montants

La valeur financière doit être stockée dans une unité précise et indépendante de l’affichage.

Présentation exemple :

```text
1 000 FCFA
1 000 XOF
1,000 XOF
```

selon la locale et la politique produit.

Le choix entre `FCFA` et `XOF` doit être configurable par canal.

## 34. Devise et précision

Le formateur doit connaître :

```text
currencyCode
minorUnitDigits
roundingPolicy
displaySymbol
displayPosition
thousandsSeparator
decimalSeparator
```

Aucun calcul financier ne doit dépendre de la chaîne affichée.

## 35. Dates et heures

Les dates doivent être stockées avec une référence temporelle non ambiguë et rendues selon le fuseau approprié.

Formats possibles :

```text
09/08/2026
9 août 2026
2026-08-09
```

Le format ISO doit être privilégié pour les échanges machine-to-machine.

## 36. Fuseaux horaires

Le système doit distinguer :

```text
storedTimestamp
userTimezone
organizationTimezone
siteTimezone
```

Un péage, une agence ou une organisation peut disposer d’un fuseau local différent du profil de l’utilisateur.

## 37. Numéros de téléphone

Les numéros doivent être stockés sous format international normalisé lorsque possible.

L’affichage peut être localisé.

Le pays et l’indicatif ne doivent pas être déduits uniquement de la langue.

## 38. Adresses

Les formulaires d’adresse doivent varier selon le pays.

Un formulaire unique basé sur le modèle français ne doit pas être imposé à tous les pays.

Champs configurables :

```text
country
region
city
commune
district
street
postalCode
landmark
additionalInfo
```

## 39. Noms de personnes

Le système ne doit pas supposer que toutes les personnes possèdent exactement :

```text
firstName + lastName
```

Le modèle d’identité doit rester compatible avec les règles KYC locales.

## 40. Recherche et accents

La recherche doit pouvoir gérer selon les cas :

- accents ;
- casse ;
- variantes d’écriture ;
- translittération autorisée ;
- noms locaux.

La normalisation destinée à la recherche ne doit pas écraser la valeur originale.

## 41. Contenus juridiques

Les contenus suivants doivent être versionnés :

- CGU ;
- politique de confidentialité ;
- consentements ;
- contrats ;
- mentions réglementaires ;
- autorisations ;
- conditions tarifaires ;
- notices de crédit ;
- notices KYC.

Chaque version doit avoir :

```text
contentId
version
languageCode
countryCode
validFrom
validTo
approvedBy
publishedAt
hash
```

## 42. Équivalence juridique

Une traduction juridique ne doit pas être considérée automatiquement comme équivalente à une version de référence.

Le système doit permettre d’indiquer :

```text
REFERENCE
OFFICIAL_TRANSLATION
INFORMATIVE_TRANSLATION
DRAFT
```

## 43. Traduction assistée par IA

Une IA peut proposer :

- traductions ;
- reformulations ;
- variantes courtes ;
- contrôles de cohérence ;
- détection de clés manquantes.

Mais une validation humaine est obligatoire pour les contenus `LEGAL`, `FINANCIAL_CRITICAL`, `SECURITY_CRITICAL` et `PUBLIC_SECTOR_CRITICAL` avant publication.

## 44. Glossaire Mansa

Un glossaire central doit éviter les variations incohérentes.

Exemples :

```text
wallet
solde
retrait
dépôt
agent
commerçant
abonnement
péage
carte virtuelle
litige
chargeback
```

Pour le bamanankan, les termes doivent être validés avec des locuteurs compétents et l’usage réel du public cible, sans traductions littérales artificielles.

## 45. Mémoire de traduction

Le système de gestion de contenu peut maintenir une mémoire de traduction afin de :

- réutiliser des textes approuvés ;
- réduire les coûts ;
- détecter les divergences ;
- accélérer l’ajout de langues.

La mémoire ne doit pas mélanger les tenants lorsqu’un contenu est confidentiel ou spécifique.

## 46. Publication des traductions

Une `TranslationRelease` regroupe une version cohérente.

Champs :

```text
id
version
product
countryCode
status
createdBy
approvedBy
publishedAt
rollbackToReleaseId
```

Statuts :

```text
DRAFT
VALIDATING
APPROVED
PUBLISHED
ROLLED_BACK
ARCHIVED
```

## 47. Rollback

Toute publication doit pouvoir être annulée rapidement.

Le rollback doit restaurer un paquet de traductions cohérent et non des clés individuelles aléatoires.

## 48. Distribution aux clients

Les clients peuvent recevoir des bundles versionnés :

```text
mobile-client
merchant
tpe
admin
state-portal
toll-kiosk
jini-voice
```

Les bundles doivent être signés ou protégés contre altération lorsque leur intégrité est critique.

## 49. Cache local

Les applications et terminaux doivent conserver un cache permettant un fonctionnement raisonnable hors ligne.

Le cache doit connaître :

```text
releaseVersion
languageCode
checksum
loadedAt
expiresAt?
```

Une mise à jour partielle corrompue ne doit pas remplacer le dernier bundle valide.

## 50. APIs

Exemples d’API :

```text
GET /localization/languages
GET /localization/locales
GET /localization/bundles/:product/:locale
POST /admin/localization/keys
POST /admin/localization/translations
POST /admin/localization/releases
POST /admin/localization/releases/:id/publish
POST /admin/localization/releases/:id/rollback
```

Les APIs d’administration nécessitent RBAC et audit.

## 51. Permissions

Permissions recommandées :

```text
localization.read
localization.translate
localization.review
localization.publish
localization.rollback
localization.manage_languages
localization.manage_legal_content
```

La personne qui traduit un texte critique ne doit pas nécessairement pouvoir le publier seule.

## 52. Audit

Le journal doit enregistrer :

- création de clé ;
- modification ;
- traduction ;
- validation ;
- publication ;
- rollback ;
- activation/désactivation d’une langue ;
- modification de fallback ;
- changement de contenu juridique.

L’audit stocke les identifiants et versions, pas seulement le texte final.

## 53. Isolation multi-tenant

Les contenus peuvent être :

```text
GLOBAL_MANSA
COUNTRY
PRODUCT
ORGANIZATION
SITE
DEVICE
```

Une organisation ne doit jamais modifier les traductions globales d’une autre organisation.

Les overrides doivent être explicites et hiérarchisés.

## 54. Hiérarchie de contenu

Exemple :

```text
Global Mansa
-> Pays
-> Organisation
-> Site
-> Terminal
```

Une valeur spécifique peut écraser une valeur générique uniquement lorsque la politique l’autorise.

## 55. Marque blanche

Les contenus variables liés à l’organisation doivent utiliser des placeholders structurés.

Exemple :

```text
Bienvenue chez {organizationName}
```

Le système ne doit pas créer une copie complète des traductions pour chaque client si seuls le nom et les couleurs changent.

## 56. Accessibilité

Les traductions doivent être testées pour :

- taille dynamique ;
- contraste ;
- lecteur d’écran ;
- descriptions accessibles ;
- navigation clavier sur web ;
- messages audio sur équipements si disponible.

Un bouton ne doit pas devenir illisible parce qu’une traduction est plus longue.

## 57. Text expansion

Les composants doivent prévoir au minimum une marge raisonnable de croissance du texte.

Les boutons critiques doivent utiliser :

- auto-layout ;
- largeur adaptable ;
- retour à la ligne contrôlé ;
- taille minimale lisible.

La réduction automatique extrême de la police est interdite.

## 58. Responsive

Les traductions doivent être testées sur :

- petit mobile ;
- grand mobile ;
- tablette ;
- TPE ;
- borne ;
- desktop ;
- écrans de faible résolution.

## 59. Erreurs techniques

Les utilisateurs ne doivent pas voir :

```text
TRANSLATION_KEY_NOT_FOUND
undefined
null
payments.error.card_declined
```

Les logs techniques peuvent conserver un code d’erreur stable tandis que l’utilisateur reçoit un message localisé.

## 60. Codes d’erreur

Exemple :

```text
PAYMENT_CARD_DECLINED
```

avec rendu :

```text
fr: Paiement refusé. Essayez une autre carte ou un autre moyen de paiement.
bm: traduction approuvée
en: Payment declined. Try another card or payment method.
```

Le code reste identique dans tous les pays.

## 61. Tests automatisés

Tests minimaux :

- aucune clé obligatoire manquante ;
- aucune clé orpheline critique ;
- variables identiques entre langues ;
- pluralisation valide ;
- bundles JSON valides ;
- fallback sans boucle ;
- taille maximale des bundles ;
- absence de HTML interdit ;
- contenus critiques approuvés ;
- compatibilité hors ligne.

## 62. Pseudo-localisation

Le CI doit pouvoir générer une pseudo-locale afin de détecter :

- textes tronqués ;
- composants trop petits ;
- chaînes codées en dur ;
- problèmes de caractères Unicode.

Exemple :

```text
[!!! Môñtåñt à påyér !!!]
```

Cette locale n’est jamais publiée aux utilisateurs.

## 63. Tests visuels

Les écrans critiques doivent être testés dans plusieurs langues, notamment :

- onboarding ;
- KYC ;
- paiement ;
- transfert ;
- carte ;
- reçu ;
- support ;
- bornes ;
- portail État.

## 64. Métriques

Métriques recommandées :

```text
translation_missing_total
translation_fallback_total
translation_bundle_load_failure_total
translation_release_rollback_total
language_selection_total
voice_language_detection_confidence
```

Les métriques ne doivent pas exposer le texte ou les données sensibles.

## 65. Performance

Le rendu d’une traduction ne doit pas nécessiter une requête réseau à chaque affichage.

Les bundles sont chargés et mis en cache.

Les mises à jour peuvent utiliser :

- ETag ;
- checksum ;
- delta contrôlé ;
- version complète.

## 66. Sécurité

Les paquets de traduction ne doivent jamais contenir :

- secrets ;
- clés API ;
- mots de passe ;
- données personnelles réelles ;
- tokens de production.

Les interfaces d’édition et publication sont protégées par authentification forte et RBAC.

## 67. Contenus distants

La capacité de mettre à jour un texte à distance ne doit pas devenir un moyen de contourner la revue applicative pour modifier une logique métier.

Une traduction ne peut pas :

- changer un montant ;
- modifier une règle de frais ;
- désactiver une vérification ;
- changer un rôle ;
- ouvrir une barrière ;
- exécuter du code.

## 68. Compatibilité matériel multi-fournisseurs

Pour les bornes, TPE et équipements, le moteur de localisation doit être indépendant du constructeur.

Les adaptateurs matériels exposent des événements métier stables.

Exemple :

```text
CASH_NOT_AVAILABLE
CARD_READER_OFFLINE
RECEIPT_PRINTER_EMPTY
```

L’interface choisit ensuite la traduction appropriée.

Le matériel peut utiliser relais/contact sec, SDK, API, TCP/IP, série ou autre interface industrielle documentée sans changer les clés de contenu.

## 69. Trois niveaux d’équipement péage

Les traductions et messages doivent fonctionner sur :

1. voie automatique complète ;
2. voie semi-automatique avec gestion sécurisée des espèces ;
3. poste numérisé à faible coût.

Le déploiement progressif ne doit pas obliger l’État à remplacer immédiatement tous les équipements.

## 70. Modèles commerciaux matériel

La localisation doit fonctionner que le matériel soit :

```text
A. acheté directement par l’État ou le concessionnaire
B. fourni, intégré ou revendu par Mansa
```

Les textes et marques restent configurables indépendamment de la propriété du matériel.

## 71. Qualité du bamanankan

Les traductions bamanankan doivent viser la compréhension réelle par les utilisateurs.

Le processus doit inclure :

- locuteurs compétents ;
- relecture ;
- tests terrain lorsque le contenu est grand public ;
- cohérence terminologique ;
- préférence pour des formulations simples ;
- possibilité de conserver certains termes techniques internationaux lorsqu’ils sont mieux compris.

Une traduction artificiellement littérale ne doit pas être publiée uniquement pour remplir une case « langue disponible ».

## 72. Contenus hybrides et code-switching

Dans certains contextes vocaux ou conversationnels, les utilisateurs peuvent mélanger français et bamanankan.

Jini peut détecter et gérer ce mélange lorsque les modèles utilisés le permettent.

L’interface classique doit toutefois conserver des traductions structurées par langue afin de rester testable et maintenable.

## 73. Gouvernance

Responsabilités recommandées :

```text
Product Owner
Localization Manager
Translator
Reviewer
Legal Reviewer
Security Reviewer
Publisher
```

Les rôles peuvent être regroupés dans une petite équipe mais les actions critiques restent tracées.

## 74. Workflow d’une nouvelle langue

1. créer `Language` ;
2. définir locales et fallback ;
3. générer le catalogue de clés ;
4. traduire ;
5. valider glossaire ;
6. vérifier variables et pluriels ;
7. tester interfaces ;
8. valider contenus critiques ;
9. publier une release pilote ;
10. mesurer erreurs/fallback ;
11. généraliser progressivement.

## 75. Rollout progressif

Une langue peut être activée :

```text
INTERNAL
BETA
PERCENTAGE
ORGANIZATION
REGION
COUNTRY
GENERAL_AVAILABILITY
```

Le moteur de feature flags peut être utilisé pour contrôler le rollout sans mélanger la logique de traduction et la logique de ciblage.

## 76. Critères d’acceptation

Le module est considéré prêt lorsque :

- les clés UI ne sont plus codées en dur dans les parcours ciblés ;
- FR/BM/EN peuvent être chargés selon politique Mali ;
- le fallback est déterministe ;
- les montants/dates sont formatés par locale ;
- les bundles fonctionnent hors ligne ;
- les bornes conservent les messages essentiels hors réseau ;
- les contenus critiques exigent une approbation ;
- les overrides multi-tenant sont isolés ;
- une release peut être publiée et rollbackée ;
- la pseudo-localisation passe en CI ;
- les tests vérifient les variables et clés manquantes ;
- aucune donnée sensible ni secret n’est placé dans les traductions.

## 77. Hors périmètre initial

Ne sont pas nécessaires dans la première implémentation :

- traduction de centaines de langues ;
- traduction automatique temps réel de toutes les interfaces ;
- système de traduction propriétaire complet ;
- génération automatique non validée de textes juridiques ;
- translittération universelle.

L’architecture doit néanmoins permettre une extension progressive.

## 78. Résultat attendu

Mansa dispose d’un moteur de localisation unique, multi-pays, multi-tenant et multi-canal capable de servir les applications mobiles, web, TPE, bornes, documents, notifications et services vocaux.

Le produit peut être présenté sous la marque Mansa, celle d’un État, d’un concessionnaire ou d’une entreprise tout en conservant les mêmes règles métier et les mêmes identifiants techniques.

La langue devient une couche de présentation et de contenu gouvernée, jamais une duplication de la logique métier.
