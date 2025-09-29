Pinned multer to v1 and re-added multer-gridfs-storage

Decision:
- To support `multer-gridfs-storage@5.0.2` the project now pins `multer` to a compatible 1.x version (`^1.4.2`). This resolves the ERESOLVE error seen during Vercel builds.

What changed:
- `backend/package.json` now uses `multer@^1.4.2` and includes `multer-gridfs-storage@^5.0.2`.
- A fresh `package-lock.json` was generated locally after installing the pinned versions.

How to reproduce locally:
1. cd backend
2. npm install

Deployment notes for Vercel:
- After pushing these changes, redeploy on Vercel. If Vercel uses an old cache, clear the build cache and redeploy.
- This approach downgrades `multer` to 1.x to match the peer dependency of `multer-gridfs-storage`.

Security note:
- Multer 1.x has known CVE advisories; if you plan to keep this long-term, consider auditing the security implications. The alternate approach is to use `multer@2.x` and implement GridFS uploads manually using `multer.memoryStorage()` and `mongodb`'s `GridFSBucket`.

If you want, I can now either:
1) Implement GridFS upload handlers using `multer@2.x` + `GridFSBucket` (keeps multer modern), or
2) Leave the current pinned approach (downgrade) and ensure Vercel builds succeed.

Tell me which option you prefer.