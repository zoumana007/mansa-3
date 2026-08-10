# Finalisation documentaire et handoff Codex

Date de référence : 2026-08-10.

## Statut

La phase de documentation fonctionnelle extensive de Mansa est considérée suffisamment complète pour ne plus bloquer le développement. Les nouveaux besoins découverts pendant l’implémentation doivent désormais être traités comme des évolutions ciblées des cahiers des charges, et non comme une raison de retarder le code.

Les contrôles de recherche effectués au moment de cette finalisation n’ont pas identifié de marqueurs génériques `TODO`, `À compléter depuis l’export DeepSeek` ou `Hypothèse à valider` dans les dépôts concernés. Cela ne constitue pas une preuve formelle qu’aucune précision métier ne sera nécessaire pendant l’implémentation.

## Domaines couverts par la documentation

La documentation existante couvre notamment :

- identité, authentification, sessions, KYC/KYB, rôles et permissions ;
- comptes, wallets, Ledger, transferts, paiements, QR, NFC et cartes ;
- cash-in, cash-out, distributeurs, réseau Agent, float et caisse ;
- frais, commissions, tarification, plafonds, vélocité et partage de revenus ;
- remboursements, reversals, mandats, prélèvements, payouts et paiements de masse ;
- Commerce, facturation, reçus, commandes, stocks, fidélité et services professionnels ;
- applications Client, Commerce, Agent, TPE, Admin Lite et Hub/Annuaire ;
- portail Admin Web et fonctions de supervision ;
- API partenaires, webhooks, sandbox et plateforme développeur ;
- flotte de terminaux et équipements ;
- support, litiges, fraude, risque, conformité et audit ;
- données, rétention, suppression, export et gouvernance ;
- observabilité, incidents et continuité opérationnelle ;
- État : taxes, amendes, bourses, cartes étudiantes/multiservices, transports, péages et services publics ;
- péages : barrières, RFID, ANPR, QR, EMV/NFC, espèces XOF, rendu de monnaie, bornes multi-constructeurs et fonctionnement dégradé ;
- Jini et Jini Voice ;
- analytics, IA et fonctions transverses documentées.

## Règle de priorité à partir de maintenant

Le développement doit primer sur l’ajout continu de nouveaux documents génériques.

Avant de créer un nouveau cahier des charges :

1. rechercher si le besoin est déjà documenté ;
2. compléter le document existant lorsqu’il s’agit du même domaine ;
3. créer un nouveau document uniquement si le besoin constitue réellement un nouveau sous-domaine ;
4. ne jamais recréer sous un autre nom une fonction déjà couverte.

## Source de vérité et branches

`mansa-fin` et `mansa-fin2/main` portent la documentation de référence synchronisée.

Le développement applicatif déjà commencé dans `mansa-fin2` doit être poursuivi sur la branche de développement prévue à cet effet. La documentation de `main` doit être intégrée proprement sans écraser le code existant.

## Ordre de reprise recommandé

1. synchroniser proprement la documentation récente avec la branche de développement ;
2. exécuter installation, qualité, tests et build ;
3. auditer le code réellement existant avant de créer un module ;
4. terminer les écarts du réseau Agent/Cash Network ;
5. terminer QR et identification commerçant ;
6. terminer tarification, frais et commissions configurables ;
7. construire progressivement les parcours mobiles réels ;
8. compléter Admin Web ;
9. poursuivre cartes, paiements externes et intégrations via interfaces/mocks ;
10. poursuivre conformité, support, fraude, État, Hub/Annuaire et Jini par lots testables.

## Définition de terminé pour un lot de code

Un lot n’est pas terminé parce que l’interface existe. Il doit, selon sa nature, inclure :

- contrats et validation des entrées ;
- autorisation et isolation multi-tenant ;
- migrations ;
- logique métier serveur ;
- Ledger et idempotence pour les flux financiers ;
- audit ;
- erreurs et états dégradés ;
- tests positifs et négatifs ;
- UI réelle si le lot possède une interface ;
- documentation mise à jour ;
- aucune donnée sensible ou secret dans Git.

## Sécurité

Le développement doit conserver les contrôles indépendants : GitGuardian, Snyk, Semgrep, audit des dépendances, revue approfondie lorsqu’elle est disponible et OWASP ZAP sur staging. Aucun agent ne doit supprimer un test, désactiver une règle ou ignorer une vulnérabilité critique/élevée uniquement pour rendre la CI verte.

## Dépendances externes

Les partenaires bancaires, acquéreurs, réseaux cartes, Mobile Money, fournisseurs KYC, SMS/e-mail/push, matériels TPE, bornes, RFID, ANPR, téléphonie et HSM/KMS ne doivent pas bloquer le développement. Utiliser des interfaces, adaptateurs, mocks et environnements sandbox jusqu’à fourniture des accès réels.

## Décision de handoff

À compter de ce document, Codex peut poursuivre immédiatement le développement à partir du code existant. La documentation doit accompagner le code et évoluer avec lui, mais il n’est plus nécessaire d’attendre la création de nouveaux cahiers des charges génériques avant de commencer un lot déjà spécifié.
