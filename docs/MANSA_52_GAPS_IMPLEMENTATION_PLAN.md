# MANSA — Plan d’implémentation des 52 briques manquantes

Ce document sert de référence de travail pour compléter progressivement MANSA sans réduire les fonctionnalités existantes ni décider du MVP à la place du propriétaire.

## Règles d’exécution
- Inspecter le code avant toute modification et éviter les doublons.
- Implémenter des briques modulaires, testables et configurables.
- Ajouter migrations, services, API, validations, tests et documentation lorsque nécessaire.
- Ne jamais committer de secrets.
- Laisser le dépôt dans un état cohérent et autant que possible compilable/testable.

## Les 52 points
1. Ledger financier en partie double.
2. Rapprochement financier automatique.
3. Moteur de risque et fraude.
4. Gestion complète des statuts de transaction.
5. Gestion des erreurs et reprises automatiques.
6. Idempotence des paiements.
7. Gestion de la liquidité des agents.
8. Back-office opérationnel avancé.
9. Double validation pour les opérations sensibles.
10. Moteur de frais et commissions.
11. Calcul de rentabilité par transaction.
12. Gestion avancée des plafonds.
13. Gestion des litiges et chargebacks.
14. Gestion des réserves commerçants.
15. Gestion des règlements commerçants.
16. Gestion des suspensions et gels de fonds.
17. Recovery de compte sécurisé.
18. Gestion multi-appareils et sessions.
19. Device fingerprinting.
20. Centre de consentement.
21. Gestion de la conservation des données.
22. Export des données utilisateur et suppression lorsque juridiquement possible.
23. Audit logs immuables.
24. Gestion avancée des rôles et permissions.
25. Gestion des secrets et clés cryptographiques.
26. HSM/KMS pour les éléments sensibles lorsque nécessaire.
27. Monitoring et observabilité.
28. Alertes automatiques d’incident.
29. Disaster Recovery.
30. Business Continuity Plan.
31. Feature flags.
32. Configuration par pays.
33. Gestion centralisée des fournisseurs.
34. Failover fournisseur.
35. Sandbox partenaires.
36. Portail API / développeurs.
37. Gestion des webhooks clients.
38. Versioning des API.
39. Centre de notifications multicanal.
40. Gestion des modèles de notification par langue et pays.
41. Support client structuré.
42. Gestion des réclamations réglementaires.
43. Gestion des bénéficiaires enregistrés et listes de confiance.
44. Gestion des héritiers / succession / titulaire décédé selon les règles applicables.
45. Gestion des comptes mineurs ou sous contrôle si MANSA les autorise.
46. Détection des comptes dormants et règles associées.
47. Reporting financier interne.
48. Reporting conformité.
49. Reporting partenaires.
50. Moteur de règles configurable.
51. Gestion des versions des CGU et politiques avec preuve d’acceptation.
52. Architecture claire des responsabilités entre MANSA, banque partenaire, Mobile Money, réseaux cartes et autres prestataires.

## État d’implémentation
`Partiel` signifie que le cœur métier existe en code mais qu’une persistance/API/intégration production peut encore être nécessaire.

- 2 Rapprochement automatique : **Partiel** (`ReconciliationEngine`, détection manquant/montant/statut).
- 3 Risque et fraude : **Partiel** (`RiskEngine`, signaux device/pays/vélocité/nouveau compte/cash-out rapide).
- 5 Erreurs et reprises : **Partiel** (`RetryPlanner`, backoff exponentiel plafonné).
- 7 Liquidité agents : **Partiel** (`AgentLiquidityManager`, cash/float/seuils/alertes).
- 33 Gestion centralisée des fournisseurs : **Partiel** (`ProviderRouter`).
- 34 Failover fournisseur : **Partiel** (sélection du fournisseur sain suivant la priorité).

## Journal d’avancement
- 2026-08-14 : plan initial ajouté.
- 2026-08-14 : création du package TypeScript `packages/mansa-core` pour le lot résilience/opérations : rapprochement, scoring risque/fraude, stratégie de retry, liquidité agents et routage/failover fournisseurs. Ajout de tests unitaires et d’une CI GitHub dédiée. Les autres briques du noyau financier restent à porter dans ce dépôt lors des prochains lots.
