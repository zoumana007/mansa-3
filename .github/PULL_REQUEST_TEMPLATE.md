## Objectif

<!-- Décrire le résultat attendu. -->

## Changements

<!-- Lister les changements réalisés. -->

## Applications concernées

<!-- Indiquer « aucune » si le changement ne concerne que le socle. -->

## Risques

<!-- Décrire les risques et leurs mesures de réduction. -->

## Tests exécutés

- [ ] Tests qualité du dépôt
- [ ] Build complet
- [ ] Semgrep
- [ ] GitGuardian
- [ ] Snyk
- [ ] `/ultrareview` si disponible dans l’environnement de revue
- [ ] OWASP ZAP si un environnement staging est déployé et que le changement expose une surface HTTP

## Sécurité fonctionnelle

- [ ] Authentification vérifiée si concernée.
- [ ] Autorisation/RBAC vérifiée si concernée.
- [ ] Isolation multi-tenant testée si concernée.
- [ ] Tests négatifs d’accès ajoutés pour les opérations sensibles.
- [ ] Idempotence/double traitement vérifiés pour les opérations financières.
- [ ] Aucun contrôle de sécurité critique n’est laissé uniquement au client mobile/web.

## Migration

<!-- Indiquer explicitement si une migration est présente. -->

## Configuration

<!-- Indiquer les nouvelles variables sans inclure de secret. -->

## Rollback

<!-- Décrire la procédure de retour arrière. -->

## Checklist

- [ ] Aucun secret n’est inclus.
- [ ] Aucun finding critique/élevé n’est ignoré sans acceptation de risque documentée.
- [ ] Aucun test ou contrôle de sécurité n’a été désactivé uniquement pour faire passer la CI.
- [ ] Aucun document officiel n’est modifié sans validation explicite.
- [ ] Aucun module fonctionnel n’est supprimé.
- [ ] Les changements sont minimaux et compatibles avec l’architecture Mansa.
