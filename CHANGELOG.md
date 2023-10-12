# [0.1.0-develop.10](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/compare/v0.1.0-develop.9...v0.1.0-develop.10) (2023-09-16)


### Bug Fixes

* creating chainProgressListener event handler wrong ([e0d3a3d](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/commit/e0d3a3de8f687b560a18a5a52425547de0bed79e))

# [0.1.0-develop.9](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/compare/v0.1.0-develop.8...v0.1.0-develop.9) (2023-09-09)

# [0.1.0-develop.8](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/compare/v0.1.0-develop.7...v0.1.0-develop.8) (2023-09-02)

# [0.1.0-develop.7](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/compare/v0.1.0-develop.6...v0.1.0-develop.7) (2023-08-04)


### Bug Fixes

* we need flag ad and rd on the dns query. rd is to request recursive lookup and ad is to ensure we only get DNSSEC responses ([67025f0](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/commit/67025f0f687fe566a3751e52d3cd11441dcd93a9))
* we need to override the tcp client on the NS icann resolver to pipe connections properly ([1a80319](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/commit/1a803193e6b6b18b1433360c2e26118ef8011094))

# [0.1.0-develop.6](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/compare/v0.1.0-develop.5...v0.1.0-develop.6) (2023-08-03)


### Bug Fixes

* if the ad flag is not set (no dnssec) return an empty result for security ([cd571db](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/commit/cd571dbceb440be25e697c05d1186ed3675163a8))

# [0.1.0-develop.5](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/compare/v0.1.0-develop.4...v0.1.0-develop.5) (2023-08-02)


### Bug Fixes

* add a patch for bns to export TCPSocket ([aaee3ac](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/commit/aaee3acb929089472ca82215cda0ebb39bb00780))
* add b4a patch ([e31973b](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/commit/e31973be7056efcacdfa32f82f068b3075bbe5cb))

# [0.1.0-develop.4](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/compare/v0.1.0-develop.3...v0.1.0-develop.4) (2023-08-02)


### Bug Fixes

* use removeListener ([2eef509](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/commit/2eef5099c8277624e88b9a310aed14adf78e4b3f))


### Features

* add dns query api that uses mock sockets and a dedicated hyper proxy for DNS (port 53) requests ([d675a44](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/commit/d675a44b4e77a1c0aa2210f5bea3d538476f63ac))

# [0.1.0-develop.3](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/compare/v0.1.0-develop.2...v0.1.0-develop.3) (2023-07-29)


### Features

* add name api ([e612211](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/commit/e6122110c5e9d42773aeb57e0bfee2cee0e6febf))

# [0.1.0-develop.2](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/compare/v0.1.0-develop.1...v0.1.0-develop.2) (2023-07-23)

# [0.1.0-develop.1](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/compare/v0.0.2-develop.1...v0.1.0-develop.1) (2023-07-23)


### Bug Fixes

* await swarm.join ([f08c87c](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/commit/f08c87c1845b7561c9aea1f7c21cf1f5528f92b7))
* need to override protomux with our kernel-protomux-client ([61050a5](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/commit/61050a5a054686c65a4e1e58035e39b6e37c25d6))


### Features

* add registry api for use with network registry ([f5ce851](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/commit/f5ce8518bb5261fbf25d5281c9f31ead99d735fd))
* add status api ([024c810](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/commit/024c810edf8a9f57693d89d44c785306d3edee89))

## [0.0.2-develop.1](https://git.lumeweb.com/LumeWeb/kernel-handshake-node/compare/v0.0.1...v0.0.2-develop.1) (2023-07-06)
