# Mansa — Internationalisation, langues, localisation et accessibilité

## 1. Objet

Ce document définit le cadre d’internationalisation, de localisation linguistique et d’accessibilité de Mansa.

Il couvre :

- applications client ;
- application commerçant ;
- application agent ;
- application TPE ;
- Admin Lite ;
- portail administrateur ;
- portail État ;
- annuaire ;
- site web ;
- developer portal ;
- Jini et Jini Voice ;
- notifications ;
- reçus et factures ;
- bornes, péages, parkings et terminaux en libre-service ;
- écrans embarqués et interfaces partenaires.

L’objectif est que Mansa puisse fonctionner proprement au Mali puis dans d’autres pays, sans dupliquer les applications par langue ou par territoire, tout en conservant une expérience compréhensible, cohérente, accessible et configurable par organisation.

## 2. Principes de référence

Mansa doit respecter les principes suivants :

1. aucune chaîne visible ne doit être codée en dur lorsqu’elle doit être traduisible ;
2. langue, pays, devise, fuseau horaire et formats locaux sont des dimensions distinctes ;
3. les contenus administratifs, juridiques et financiers peuvent avoir des traductions différentes des libellés UX ;
4. un changement de langue ne doit jamais modifier une donnée financière ou métier ;
5. l’utilisateur doit pouvoir comprendre une opération critique avant de la confirmer ;
6. les textes sensibles doivent éviter les traductions automatiques non validées en production ;
7. une organisation peut personnaliser son branding et ses langues sans modifier le code ;
8. l’accessibilité doit être intégrée aux composants et non ajoutée en fin de projet ;
9. les terminaux et bornes doivent rester utilisables dans des environnements de faible connectivité ;
10. les langues disponibles peuvent dépendre du produit, du pays, de l’organisation et du canal.

## 3. Modèle de langues

Le système doit gérer un catalogue global de langues.

Champs recommandés :

```text
Language
- code
- locale
- englishName
- nativeName
- writingDirection
- isActive
- fallbackLanguageCode
- pluralizationRule
- dateFormatProfile
- numberFormatProfile
- currencyFormatProfile
- textToSpeechSupport
- speechToTextSupport
- humanValidationStatus
```

Exemples :

```text
fr
bm
 en
ar
pt
es
```

Le code produit ne doit jamais dépendre directement d’un nom de langue affiché.

## 4. Mali — langues initiales

Pour le Mali, les interfaces critiques doivent prévoir au minimum :

- français (`fr`) ;
- bamanankan / bambara (`bm`) lorsque la traduction validée existe ;
- anglais (`en`) lorsque pertinent pour touristes, partenaires, diaspora ou usages professionnels.

Des langues supplémentaires peuvent être activées progressivement selon la disponibilité des traductions et les besoins du service.

La présence d’une langue dans le catalogue ne signifie pas que toutes les fonctionnalités voix sont automatiquement disponibles dans cette langue.

## 5. Politique de fallback

Chaque traduction doit utiliser une chaîne de fallback déterministe.

Exemple :

```text
bm-ML
→ bm
→ fr-ML
→ fr
→ clé technique de secours contrôlée
```

Une interface critique ne doit jamais afficher une page vide uniquement parce qu’une traduction manque.

Les manques doivent être détectés en CI ou dans les outils de contenu.

## 6. Clés de traduction

Les textes sont référencés par des clés stables.

Exemples :

```text
auth.login.title
payments.confirm.amount
payments.status.success
toll.cash.insert_notes
kyc.document.passport
errors.network.offline
```

Les clés ne doivent pas contenir directement le texte français.

Les renommages de clés doivent être versionnés afin de ne pas casser les clients plus anciens.

## 7. Séparation entre texte produit et contenu éditorial

Deux catégories sont distinguées.

### 7.1 Texte produit

Exemples :

- boutons ;
- labels ;
- erreurs ;
- navigation ;
- statuts ;
- instructions de paiement.

Ils sont gérés dans le système i18n applicatif.

### 7.2 Contenu éditorial

Exemples :

- CGU ;
- politique de confidentialité ;
- aides ;
- FAQ ;
- campagnes ;
- communication État ;
- informations institutionnelles.

Ils peuvent être gérés via un CMS ou un moteur de contenu avec versions et validations.

## 8. Traduction et validation humaine

Pour les contenus sensibles, Mansa doit pouvoir distinguer :

```text
DRAFT
MACHINE_TRANSLATED
HUMAN_REVIEWED
APPROVED
REJECTED
DEPRECATED
```

Les catégories suivantes doivent exiger une validation humaine avant production lorsque traduites :

- conditions contractuelles ;
- KYC/KYB ;
- sanctions et conformité ;
- paiements ;
- consentements ;
- messages de fraude ;
- instructions de sécurité ;
- amendes et services État ;
- messages de péage ayant une conséquence financière.

## 9. Formats locaux

La langue ne doit pas déterminer seule les formats.

Le contexte local doit gérer :

- devise ;
- séparateurs de milliers ;
- séparateur décimal ;
- date ;
- heure ;
- fuseau horaire ;
- téléphone ;
- adresse ;
- pays ;
- unités.

Exemple Mali :

```text
Montant : 1 000 FCFA
Devise interne : XOF
Téléphone : +223 ...
Fuseau : Africa/Bamako
```

Les montants restent stockés en unités monétaires précises selon les règles financières ; seul l’affichage est localisé.

## 10. Devise et localisation

Mansa ne doit jamais convertir une devise uniquement parce que la langue change.

Exemple : un utilisateur choisissant anglais au Mali continue à voir les montants XOF lorsque le produit fonctionne en XOF.

Toute conversion monétaire relève du moteur FX et non de l’i18n.

## 11. Nombres et montants

Les montants financiers doivent être affichés de façon stable.

Règles :

- chiffres lisibles ;
- devise toujours visible pour les opérations sensibles ;
- pas de retour à la ligne au milieu du montant ;
- chiffres tabulaires lorsque nécessaire ;
- symbole ou code devise conforme au contexte ;
- pas d’ambiguïté entre virgule et point.

## 12. Dates et heures

Les dates affichées utilisent le fuseau approprié au contexte métier.

Exemples :

- date d’une transaction : fuseau du ledger ou fuseau métier documenté ;
- affichage utilisateur : fuseau local ;
- audit : timestamp UTC conservé en source ;
- reçus : date locale + fuseau si nécessaire.

Les logs techniques ne doivent pas dépendre de la langue utilisateur.

## 13. Notifications multilingues

Chaque modèle de notification peut comporter plusieurs variantes linguistiques.

Canaux :

- push ;
- SMS ;
- email ;
- WhatsApp si intégré ;
- in-app ;
- voix.

Le système choisit la langue selon :

1. langue explicitement choisie ;
2. préférence du profil ;
3. préférence de l’organisation ;
4. langue du pays ;
5. fallback global.

Les notifications réglementaires peuvent imposer une ou plusieurs langues selon le pays.

## 14. Reçus et factures

Les reçus doivent supporter :

- langue utilisateur ;
- langue imposée par l’organisation ;
- contenu bilingue si requis ;
- devise et format local ;
- mentions légales ;
- branding de l’exploitant ;
- mention facultative `Propulsé par Mansa`.

Une traduction ne doit jamais modifier :

- montant ;
- identifiant transaction ;
- date source ;
- référence paiement ;
- taxes ;
- identité du bénéficiaire.

## 15. Accessibilité — principes généraux

Les interfaces Mansa doivent viser une expérience compatible avec les standards d’accessibilité applicables au canal.

Les composants doivent intégrer :

- contraste suffisant ;
- tailles de texte adaptées ;
- focus visible ;
- navigation clavier web ;
- libellés accessibles ;
- ordre de lecture cohérent ;
- alternatives textuelles ;
- erreurs compréhensibles ;
- réduction des animations ;
- absence de dépendance exclusive à la couleur.

## 16. Mobile

Les applications mobiles doivent prévoir :

- VoiceOver/TalkBack ;
- tailles dynamiques lorsque techniquement compatibles ;
- zones tactiles suffisamment grandes ;
- labels d’accessibilité ;
- ordre de focus ;
- retour haptique non indispensable à la compréhension ;
- alternatives aux gestes complexes.

Une action financière critique ne doit pas dépendre d’un geste non accessible sans alternative.

## 17. Web et portails

Les portails web doivent prévoir :

- structure sémantique ;
- navigation clavier ;
- focus visible ;
- labels de formulaires ;
- erreurs associées aux champs ;
- titres hiérarchiques ;
- tableaux accessibles ;
- alternatives aux graphiques critiques ;
- contraste et zoom.

## 18. Bornes et terminaux libre-service

Les bornes doivent privilégier :

- instructions très courtes ;
- gros caractères ;
- contraste fort ;
- pictogrammes universels ;
- feedback visuel et sonore ;
- langue sélectionnable ;
- position des actions cohérente ;
- minimisation du nombre d’étapes ;
- mode dégradé compréhensible.

Une borne ne doit pas devenir une simple application mobile agrandie : l’écran doit guider l’usager vers les périphériques physiques réellement présents.

## 19. Bornes de péage — langues

Les bornes de péage doivent permettre une sélection rapide de langue.

Au Mali, cible initiale recommandée :

```text
FR | BM | EN
```

L’exploitant peut ajouter d’autres langues.

La langue peut être mémorisée uniquement lorsqu’un contexte utilisateur fiable existe ; pour un passage anonyme, la borne revient à sa langue par défaut après la session.

Les écrans affichent uniquement les moyens de paiement réellement disponibles sur la voie.

## 20. Péage — exigences de référence obligatoires

Deux solutions de péage doivent coexister :

- **A — péage automatique classique avec barrière** ;
- **B — télépéage RFID UHF avec barrière**.

Une évolution future optionnelle vers le free-flow sans barrière peut être ajoutée sans remplacer A ni B.

Le péage classique doit pouvoir accepter, selon les canaux activés :

- billets FCFA/XOF ;
- pièces FCFA/XOF ;
- carte bancaire EMV ;
- réseaux activés par l’acquéreur, notamment Visa et Mastercard lorsqu’ils sont contractuellement disponibles ;
- NFC ;
- carte Mansa ;
- wallet Mansa ;
- QR ;
- Mobile Money.

Mobile Money doit pouvoir être activé ou désactivé par l’administration aux niveaux :

```text
NATIONAL
NETWORK
TOLL_PLAZA
LANE
```

Chaque changement conserve date d’effet, auteur, ancienne valeur, nouvelle valeur et audit. Le canal ne doit jamais être supprimé automatiquement.

Le télépéage initial utilise :

- tag UHF RFID passif ;
- véhicule associé ;
- compte ou abonnement associé ;
- lecteur/antenne ;
- contrôleur local ;
- relais `OPEN` ;
- barrière ;
- capteurs de passage.

## 21. Péage — fonctionnement hors ligne

Les textes critiques nécessaires au mode hors ligne doivent être disponibles localement.

Le contrôleur ou terminal peut mettre en cache :

- dictionnaires de traduction validés ;
- tarifs ;
- règles minimales ;
- messages de panne ;
- statuts de paiement ;
- messages de resynchronisation.

Le fonctionnement hors ligne doit rester sécurisé, sans double débit, avec idempotence et resynchronisation.

## 22. Péage — matériel multi-fournisseurs

Les textes et comportements UX ne doivent pas dépendre d’un fabricant unique.

Les périphériques sont pilotés derrière des adaptateurs :

```text
EMV terminal
NFC reader
QR scanner
note validator
coin acceptor
cash recycler
receipt printer
RFID reader
ANPR adapter
barrier controller
```

Les équipements peuvent utiliser relais/contact sec ou interface industrielle documentée selon le matériel.

## 23. Péage — trois niveaux d’équipement

L’interface doit s’adapter à :

1. voie automatique complète ;
2. voie semi-automatique avec agent et gestion sécurisée des espèces ;
3. poste numérisé à faible coût.

L’État ne doit pas être obligé d’équiper tous les péages immédiatement.

Un canal non installé physiquement n’est pas affiché comme disponible.

## 24. Péage — modèles commerciaux et marque blanche

Deux modèles sont supportés :

- matériel acheté directement par l’État/concessionnaire ;
- matériel fourni, intégré ou revendu par Mansa.

Les interfaces doivent permettre une marque blanche complète :

- logo ;
- couleurs ;
- typographie compatible ;
- nom du service ;
- langues ;
- reçus ;
- bornes ;
- tags ;
- signalétique.

La mention `Propulsé par Mansa` reste facultative.

## 25. Péage — anti-corruption et UX

L’interface ne doit jamais permettre à un agent de masquer une anomalie par simple changement de langue ou de libellé.

Le système rapproche :

```text
véhicule détecté
→ catégorie
→ tarif attendu
→ paiement
→ autorisation d’ouverture
→ ouverture réelle
→ passage physique
```

Toute ouverture manuelle reste auditée, quelle que soit la langue affichée.

## 26. Jini et voix

Jini Voice distingue :

- langue d’accueil ;
- langue détectée ;
- langue de transcription ;
- langue de réponse ;
- langue de traduction éventuelle.

Pour le Mali, la détection initiale peut couvrir :

```text
fr
bm
en
```

Le système doit supporter les phrases mixtes lorsque techniquement possible sans prétendre garantir une précision parfaite.

Les transcriptions et traductions sensibles suivent la politique de rétention et confidentialité de Mansa.

## 27. Recherche et annuaire

La recherche doit tolérer :

- accents ;
- variantes de casse ;
- translittérations lorsque prévues ;
- noms locaux ;
- synonymes métier ;
- variantes linguistiques contrôlées.

Une normalisation ne doit pas altérer le nom officiel stocké.

## 28. Administration

L’administration doit pouvoir configurer :

- langues activées par pays ;
- langues par organisation ;
- langue par produit ;
- langue par borne ;
- langue par notification ;
- fallback ;
- statut de validation ;
- date d’activation ;
- version du dictionnaire.

Toute modification critique doit être auditée.

## 29. Versionnement des traductions

Les dictionnaires sont versionnés.

Exemple :

```text
TranslationBundle
- id
- locale
- domain
- version
- checksum
- status
- publishedAt
- createdBy
```

Les clients hors ligne doivent pouvoir connaître la version installée et synchroniser uniquement les changements nécessaires.

## 30. Cache et performance

Les dictionnaires peuvent être mis en cache :

- application mobile ;
- CDN ;
- terminal ;
- borne ;
- backend.

Le cache doit être invalidé lors d’une publication de traduction critique.

## 31. Sécurité

Les fichiers de traduction ne doivent contenir :

- aucun secret ;
- aucune clé API ;
- aucun mot de passe ;
- aucune donnée utilisateur réelle.

Les variables dynamiques sont injectées à l’exécution.

Exemple :

```text
payments.receipt.amount = "Montant : {amount} {currency}"
```

Les placeholders autorisés doivent être contrôlés afin d’éviter les injections ou corruptions d’affichage.

## 32. Tests automatisés

La CI doit pouvoir détecter :

- clés manquantes ;
- clés orphelines ;
- placeholders incohérents ;
- traductions vides ;
- erreurs de syntaxe ;
- chaînes codées en dur dans les zones surveillées ;
- overflow sur composants critiques ;
- régressions de contraste lorsque testables.

## 33. Tests linguistiques

La recette doit inclure :

- français ;
- bambara/bamanankan pour les parcours concernés ;
- anglais ;
- textes longs ;
- textes courts ;
- caractères spéciaux ;
- montants élevés ;
- messages d’erreur ;
- fonctionnement hors ligne.

## 34. Pseudo-localisation

Un mode de pseudo-localisation est recommandé pour détecter tôt :

- textes tronqués ;
- boutons trop petits ;
- hypothèses de longueur ;
- composants non traduisibles.

Ce mode n’est jamais activé en production utilisateur.

## 35. Analytics linguistiques

Mansa peut mesurer sans exposer de contenu sensible :

- langue sélectionnée ;
- changements de langue ;
- taux d’abandon par locale ;
- erreurs de traduction remontées ;
- fallback utilisés ;
- version du bundle.

Ces données respectent la gouvernance de confidentialité.

## 36. Support client

Le support doit voir la langue préférée d’un utilisateur ou d’une organisation lorsqu’il est autorisé à y accéder.

Les agents peuvent répondre dans une langue différente, mais l’historique doit conserver la langue de chaque message.

## 37. Déploiement par pays

Avant activation dans un nouveau pays, la checklist inclut :

- langue(s) ;
- devise ;
- format téléphone ;
- fuseau ;
- textes légaux ;
- KYC ;
- moyens de paiement ;
- langues supportées par support et voix ;
- exigences d’accessibilité ;
- tests terrain.

## 38. Gouvernance des traductions

Rôles possibles :

```text
TRANSLATION_EDITOR
TRANSLATION_REVIEWER
LEGAL_REVIEWER
PRODUCT_APPROVER
LOCAL_MARKET_ADMIN
```

La personne qui édite une traduction réglementaire ne doit pas nécessairement être la seule à pouvoir la publier.

## 39. Audit

Les événements suivants doivent être auditables :

- ajout de langue ;
- activation/désactivation ;
- changement de fallback ;
- publication d’un bundle ;
- correction d’un texte critique ;
- changement d’une mention légale ;
- activation d’une langue sur une borne ou un réseau de péage.

## 40. Critères d’acceptation

Le module est considéré correctement mis en œuvre lorsque :

1. les textes visibles sont externalisés ;
2. FR/BM/EN sont supportables sans duplication d’application ;
3. le changement de langue ne modifie aucune donnée financière ;
4. les montants et dates restent correctement localisés ;
5. les bornes peuvent fonctionner hors ligne avec leurs traductions ;
6. une organisation peut personnaliser ses langues et son branding ;
7. les interfaces essentielles restent accessibles ;
8. les traductions critiques ont un workflow de validation ;
9. les versions sont auditables ;
10. les règles péage de référence restent respectées.

## 41. Hors périmètre initial

Sont hors périmètre de la première implémentation sauf besoin explicite :

- traduction automatique libre de documents juridiques en production ;
- traduction simultanée de toutes les langues africaines ;
- garantie de reconnaissance vocale parfaite pour les langues peu dotées ;
- création d’une application distincte par langue ;
- dépendance à un unique fournisseur de traduction ou de voix.

## 42. Résultat attendu

Mansa doit disposer d’un socle linguistique unique, versionné et configurable permettant de servir plusieurs pays, organisations et équipements sans fragmentation du produit.

Le même socle doit fonctionner sur mobile, web, TPE, bornes, péages, notifications, reçus et voix, avec une attention particulière aux opérations financières, à la faible connectivité, à l’accessibilité et à la compréhension des utilisateurs.
