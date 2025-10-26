# TODO

## Fix SelectItem Empty Value Error

- [x] Update app/robots/page.tsx
  - [x] Change filterType and filterStatus initial state from '' to 'all'
  - [x] Update SelectItem values from '' to 'all' for "All types" and "All statuses"
  - [x] Modify fetchRobots to exclude 'all' from query params
  - [x] Update SelectValue placeholders
- [x] Update app/sensors/page.tsx
  - [x] Change filterType and filterStatus initial state from '' to 'all'
  - [x] Update SelectItem values from '' to 'all' for "All types" and "All statuses"
  - [x] Modify fetchSensors to exclude 'all' from query params
  - [x] Update SelectValue placeholders
- [ ] Test the application to ensure filters work correctly
