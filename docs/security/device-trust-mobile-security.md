# Sécurité — Device Trust, sécurité mobile et confiance appareil

## 1. Objet

Ce document définit le cahier des charges Mansa pour la confiance accordée aux appareils utilisés par les clients, commerçants, agents, administrateurs, partenaires et personnels publics.

L’objectif est de réduire les risques liés au vol de compte, au clonage de session, aux appareils compromis, au root/jailbreak, aux émulateurs malveillants, au partage d’identifiants, aux malwares, à l’interception locale et aux changements anormaux d’appareil.

Le Device Trust ne remplace ni l’authentification, ni le RBAC, ni le moteur de fraude. Il fournit un signal supplémentaire au moteur de décision.

## 2. Principes

Mansa doit appliquer les principes suivants :

- ne jamais faire confiance à un appareil uniquement parce qu’il a déjà été utilisé ;
- ne jamais considérer un identifiant matériel comme une preuve d’identité suffisante ;
- limiter la collecte d’identifiants persistants au strict nécessaire ;
- associer chaque décision sensible à l’utilisateur, l’organisation, la session, l’appareil, le risque et le contexte ;
- appliquer une défense en profondeur ;
- privilégier l’attestation cryptographique de plateforme lorsqu’elle est disponible ;
- conserver un mode de fonctionnement compatible avec des appareils d’entrée de gamme sans affaiblir les contrôles critiques ;
- ne pas stocker de secret maître en clair sur le terminal.

## 3. Appareils concernés

Le système doit gérer au minimum :

- smartphone client Android ;
- iPhone client ;
- smartphone/tablette agent ;
- smartphone/tablette commerçant ;
- TPE Android ;
- borne ;
- terminal administratif ;
- navigateur web ;
- poste de travail interne ;
- appareil d’un partenaire autorisé.

Chaque classe d’appareil peut recevoir une politique différente.

## 4. Modèle de données minimal

Entités recommandées :

```text
TrustedDevice
DeviceEnrollment
DeviceAttestation
DeviceSession
DeviceRiskAssessment
DeviceSecurityEvent
DeviceKey
DeviceChallenge
DeviceRevocation
DevicePolicy
```

Champs utiles :

- `deviceId` interne Mansa ;
- utilisateur ;
- organisation ;
- type d’appareil ;
- plateforme ;
- version OS ;
- version application ;
- modèle ;
- statut ;
- date d’enrôlement ;
- dernière activité ;
- niveau de confiance ;
- dernière attestation ;
- anomalies détectées ;
- clés publiques liées ;
- historique de révocation.

## 5. Niveaux de confiance

Le système doit supporter des niveaux configurables, par exemple :

```text
UNKNOWN
UNVERIFIED
VERIFIED
TRUSTED
HIGH_TRUST
SUSPICIOUS
COMPROMISED
REVOKED
```

Le niveau de confiance ne doit jamais être écrit manuellement sans trace d’audit.

## 6. Enrôlement d’un appareil

Lors de l’ajout d’un nouvel appareil :

1. authentifier l’utilisateur ;
2. collecter uniquement les métadonnées nécessaires ;
3. générer ou enregistrer une clé locale sécurisée ;
4. produire une attestation lorsque disponible ;
5. créer un challenge serveur ;
6. vérifier la preuve retournée ;
7. calculer un score de risque ;
8. demander une étape supplémentaire si nécessaire ;
9. enregistrer l’appareil ;
10. journaliser l’opération.

## 7. Clés liées à l’appareil

Lorsque la plateforme le permet, Mansa doit créer une paire de clés asymétriques liée au terminal.

La clé privée doit rester dans le stockage sécurisé natif :

- Secure Enclave / Keychain côté Apple ;
- Android Keystore / matériel sécurisé côté Android ;
- TPM ou stockage sécurisé côté poste compatible.

Le serveur conserve uniquement la clé publique et les métadonnées nécessaires.

## 8. Attestation Android

Pour Android, Mansa doit pouvoir exploiter les mécanismes d’intégrité/attestation disponibles afin d’évaluer notamment :

- authenticité de l’application ;
- intégrité de l’environnement ;
- appareil certifié ou non ;
- signaux de root ;
- débogage ou instrumentation anormale ;
- émulateur lorsque pertinent ;
- version de sécurité obsolète selon politique.

Aucun signal unique ne doit entraîner automatiquement un blocage définitif sans politique explicite.

## 9. Attestation Apple

Pour iOS/iPadOS, Mansa doit utiliser les capacités Apple disponibles pour :

- vérifier l’authenticité de l’application ;
- lier certaines preuves à l’instance d’application ;
- détecter des contextes anormaux ;
- protéger les clés dans le Keychain/Secure Enclave lorsque disponible.

## 10. Root et jailbreak

Le système doit détecter ou estimer :

- root ;
- jailbreak ;
- bootloader déverrouillé ;
- hooks connus ;
- frameworks d’instrumentation ;
- modifications d’intégrité ;
- environnement de débogage anormal.

Réponses possibles :

```text
ALLOW
ALLOW_WITH_LIMITS
STEP_UP_AUTH
READ_ONLY
BLOCK_SENSITIVE_ACTIONS
BLOCK_DEVICE
MANUAL_REVIEW
```

## 11. Émulateurs

Les émulateurs ne doivent pas être interdits globalement car ils sont nécessaires au développement et à la recette.

Le système doit distinguer :

- émulateur autorisé en développement ;
- appareil de test enregistré ;
- émulateur en Sandbox ;
- émulateur non autorisé en Production ;
- appareil physique.

Les opérations financières réelles sensibles peuvent être interdites depuis un émulateur selon politique.

## 12. Détection d’application modifiée

L’application doit pouvoir vérifier ou faire vérifier :

- signature du package ;
- bundle/application ID ;
- version ;
- canal de distribution ;
- intégrité du binaire lorsque disponible ;
- configuration de build ;
- environnement attendu.

Une application reconditionnée ou signée par un tiers doit être traitée comme suspecte.

## 13. Protection locale des données

Les données sensibles locales doivent être minimisées.

Règles minimales :

- aucun mot de passe en clair ;
- aucun PIN en clair ;
- aucun secret API de production embarqué dans l’application ;
- tokens stockés via mécanisme sécurisé ;
- chiffrement local lorsque pertinent ;
- suppression des données sensibles à la déconnexion/révocation selon politique ;
- aucune donnée carte sensible interdite par le périmètre PCI ne doit être conservée hors mécanisme autorisé.

## 14. Sessions liées à l’appareil

Une session doit pouvoir être liée à :

- utilisateur ;
- `deviceId` ;
- clé publique ;
- version application ;
- pays/contexte ;
- adresse réseau observée ;
- niveau de confiance ;
- session serveur.

Un token volé ne doit pas suffire à reproduire toutes les opérations depuis un autre appareil lorsque la politique exige une preuve de possession liée au device.

## 15. Step-up authentication

Un contrôle renforcé doit pouvoir être exigé lors de :

- nouvel appareil ;
- changement de SIM ou contexte téléphonique significatif si ce signal est disponible légalement ;
- changement brutal de pays ;
- réinitialisation de l’appareil ;
- root/jailbreak détecté ;
- ajout d’un bénéficiaire sensible ;
- gros transfert ;
- changement de mot de passe ;
- changement de numéro ;
- activation d’une carte ;
- ajout d’un administrateur ;
- modification de paramètres critiques.

## 16. Biométrie

La biométrie doit rester gérée par l’OS lorsque possible.

Mansa ne doit pas stocker l’empreinte biométrique brute du téléphone.

La biométrie locale peut déverrouiller une clé ou autoriser une opération, mais le serveur doit conserver sa propre politique de risque et d’autorisation.

## 17. Changement d’appareil

Lorsqu’un utilisateur change d’appareil :

- l’ancien appareil reste visible ;
- une confirmation peut être demandée ;
- les sessions anciennes peuvent être révoquées ;
- les limites peuvent être temporairement réduites ;
- les actions sensibles peuvent exiger un délai ou une validation supplémentaire ;
- l’événement doit être notifié et audité.

## 18. Appareil perdu ou volé

L’utilisateur ou un opérateur autorisé doit pouvoir :

- déclarer l’appareil perdu ;
- révoquer ses sessions ;
- révoquer les clés associées ;
- bloquer les opérations sensibles ;
- retirer l’appareil de la liste de confiance ;
- déclencher une vérification renforcée lors d’un nouvel enrôlement.

## 19. Appareils multiples

Le nombre d’appareils autorisés doit être configurable par produit et rôle.

Exemples :

- client : plusieurs appareils avec politique de risque ;
- agent : nombre limité ;
- commerçant : plusieurs appareils d’équipe ;
- administrateur : appareils explicitement approuvés ;
- super-admin : politique renforcée avec MFA matériel si possible.

## 20. Politique agent et commerçant

Pour les agents et commerçants, le système doit prévoir :

- appareil rattaché au point de service ;
- identité de l’opérateur ;
- horaires ;
- géographie autorisée éventuelle ;
- plafonds ;
- appareil géré ou non ;
- révocation immédiate ;
- audit des changements d’appareil.

## 21. TPE Android

Pour un TPE Android, Mansa doit pouvoir gérer :

- identifiant terminal ;
- numéro de série ;
- marchand ;
- point de vente ;
- version firmware ;
- version application ;
- certificats ;
- attestation ;
- statut ;
- capacités ;
- dernière synchronisation ;
- révocation.

Un TPE compromis ne doit pas pouvoir être réactivé sans workflow contrôlé.

## 22. Borne et équipement fixe

Une borne ou un contrôleur fixe peut utiliser :

- certificat client ;
- clé privée liée au matériel ;
- mTLS ;
- allowlist réseau ;
- identifiant d’équipement ;
- attestation ou signature locale lorsque disponible.

Cette politique s’applique notamment aux bornes de péage, sans modifier les décisions de référence sur les deux architectures de péage Mansa.

## 23. Navigateur web

Pour le Web, le système doit éviter toute fausse promesse de device fingerprint infaillible.

Les signaux navigateur peuvent servir à la détection de risque mais ne doivent pas être une identité permanente fiable.

Le système doit privilégier :

- WebAuthn/passkeys ;
- cookies sécurisés lorsque utilisés ;
- protection CSRF ;
- sessions serveur ;
- MFA ;
- détection de session anormale.

## 24. Passkeys / WebAuthn

Mansa doit pouvoir supporter les passkeys comme moyen d’authentification forte.

Exigences :

- challenge serveur ;
- vérification d’origine ;
- vérification RP ID ;
- protection contre le rejeu ;
- gestion de plusieurs credentials ;
- révocation ;
- récupération de compte distincte.

## 25. Score de risque appareil

Le moteur peut calculer un score à partir de :

- confiance de l’attestation ;
- nouveauté de l’appareil ;
- version OS ;
- root/jailbreak ;
- version application ;
- réputation réseau ;
- changement géographique ;
- comportement de session ;
- historique de fraude ;
- fréquence des changements ;
- cohérence avec les habitudes.

Le score doit rester explicable et auditable.

## 26. Décision de politique

Exemple :

```text
Device Trust
+ User Risk
+ Transaction Risk
+ Organization Policy
+ Amount
+ Context
→ ALLOW / STEP_UP / HOLD / DENY / REVIEW
```

## 27. Isolation multi-tenant

Toutes les données d’appareil doivent être isolées par tenant lorsque le contexte l’exige.

Un administrateur d’une organisation ne doit pas pouvoir consulter les appareils d’une autre organisation.

## 28. Confidentialité

Les données de Device Trust peuvent être sensibles.

Mansa doit :

- documenter les finalités ;
- minimiser les données ;
- définir des durées de conservation ;
- limiter l’accès ;
- éviter le fingerprinting excessif ;
- permettre les exports/suppressions lorsque juridiquement applicables ;
- séparer les données de sécurité des usages marketing.

## 29. Logs et audit

Événements minimaux :

```text
DEVICE_ENROLLED
DEVICE_VERIFIED
DEVICE_ATTESTATION_FAILED
DEVICE_TRUST_CHANGED
DEVICE_REVOKED
ROOT_SIGNAL_DETECTED
JAILBREAK_SIGNAL_DETECTED
APP_INTEGRITY_FAILED
NEW_DEVICE_LOGIN
DEVICE_KEY_ROTATED
DEVICE_SESSION_REVOKED
STEP_UP_REQUIRED
```

Les journaux doivent être corrélables avec les logs d’authentification, fraude, paiement et SIEM.

## 30. Alertes

Alertes possibles :

- nouvel appareil sensible ;
- plusieurs appareils ajoutés rapidement ;
- root/jailbreak ;
- attestation invalide ;
- appareil déjà lié à plusieurs identités anormales ;
- changement géographique incohérent ;
- tentative depuis terminal révoqué ;
- utilisation d’une ancienne version interdite.

## 31. Révocation et kill switch

L’administration doit pouvoir :

- révoquer un appareil ;
- révoquer une version application ;
- interdire une version OS critique ;
- bloquer un modèle compromis ;
- imposer une mise à jour ;
- forcer une réauthentification ;
- invalider toutes les sessions d’un appareil.

Toute action de masse exige permissions, motif et audit.

## 32. Mode hors ligne

Les applications nécessitant un fonctionnement hors ligne doivent conserver une politique minimale locale sans transformer le terminal en source de vérité financière.

Les opérations hors ligne doivent être :

- limitées ;
- signées ou protégées ;
- horodatées ;
- liées à l’appareil ;
- resynchronisées ;
- idempotentes ;
- contrôlées contre le double traitement.

## 33. Développement et test

Les équipes doivent disposer de profils distincts :

```text
DEVELOPMENT_DEVICE
TEST_DEVICE
CERTIFICATION_DEVICE
PRODUCTION_DEVICE
```

Les bypass de sécurité de développement ne doivent jamais être actifs dans un build Production.

## 34. CI/CD

La CI doit vérifier lorsque possible :

- absence de secret mobile embarqué ;
- signature attendue ;
- configuration des environnements ;
- dépendances vulnérables ;
- règles Semgrep ;
- Snyk ;
- GitGuardian ;
- tests d’authentification ;
- tests de révocation ;
- tests de politiques de device trust.

## 35. Tests de sécurité obligatoires

Scénarios minimaux :

- token copié vers autre appareil ;
- session révoquée ;
- appareil déclaré perdu ;
- clé locale supprimée ;
- attestation expirée ;
- attestation invalide ;
- root/jailbreak ;
- application modifiée ;
- ancien build ;
- changement d’appareil ;
- utilisateur sur plusieurs appareils ;
- tentative depuis device révoqué ;
- rejeu d’un challenge ;
- double soumission hors ligne.

## 36. Administration

Menu recommandé :

```text
Sécurité
└── Appareils
    ├── Appareils actifs
    ├── Nouveaux appareils
    ├── Appareils suspects
    ├── Appareils révoqués
    ├── Attestations
    ├── Politiques
    ├── Versions application
    ├── Alertes
    └── Audit
```

## 37. Indicateurs

KPIs possibles :

- appareils actifs ;
- nouveaux appareils/jour ;
- taux d’attestation réussie ;
- appareils suspects ;
- appareils rootés/jailbreakés ;
- révoqués ;
- step-up déclenchés ;
- fraude liée à changement d’appareil ;
- versions obsolètes ;
- temps moyen de révocation.

## 38. Déploiement progressif

Le Device Trust doit pouvoir être activé progressivement :

1. collecte passive des signaux ;
2. scoring sans blocage ;
3. step-up sur cas à risque ;
4. blocage des appareils manifestement compromis ;
5. politiques renforcées par rôle et produit.

Cette approche évite de bloquer brutalement des utilisateurs légitimes tout en améliorant progressivement la sécurité.

## 39. Règle finale

Aucune décision financière sensible ne doit reposer uniquement sur une information contrôlée par l’application cliente. Le serveur Mansa reste l’autorité de décision, combine identité, session, appareil, permissions, risque et règles métier, et conserve un audit complet de la décision.
