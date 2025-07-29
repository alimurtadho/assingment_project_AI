# GitHub Actions Workflow untuk Node.js

File ini berisi penjelasan tentang workflow GitHub Actions yang telah dibuat untuk aplikasi Node.js CodeGuardian AI.

## File Workflow yang Dibuat

### 1. `.github/workflows/simple-ci.yml` - Workflow Utama
Workflow sederhana yang fokus pada 2 job utama sesuai permintaan:

#### Trigger
- Dijalankan setiap kali ada **push ke branch 'main'**

#### Jobs

**Job 1: `lint`** - Pemeriksaan Kualitas Kode
- ✅ Checkout kode dari repository
- ✅ Setup Node.js versi 18
- ✅ Install dependencies dengan `npm ci`
- ✅ Jalankan ESLint untuk memeriksa kualitas kode
- ✅ Cek formatting dengan Prettier

**Job 2: `test`** - Menjalankan Test Suite
- ✅ **Dijalankan SETELAH job `lint` berhasil** (menggunakan `needs: lint`)
- ✅ Checkout kode dari repository
- ✅ Setup Node.js versi 18
- ✅ Install dependencies backend dan frontend
- ✅ Jalankan test backend
- ✅ Jalankan test frontend
- ✅ Build aplikasi frontend
- ✅ Notifikasi sukses

### 2. `.github/workflows/nodejs-ci.yml` - Workflow Lengkap
Workflow yang lebih komprehensif dengan database dan fitur tambahan.

### 3. `.github/workflows/ci-cd.yml` - Workflow Full CI/CD
Workflow lengkap dengan security scan dan deployment.

## File Konfigurasi Pendukung

### `.eslintrc.json`
Konfigurasi ESLint untuk menjaga kualitas kode:
- Rules untuk indentasi, quotes, semicolons
- Warning untuk console.log dan unused variables
- Error untuk penggunaan var dan format yang salah

### `.prettierrc`
Konfigurasi Prettier untuk formatting kode:
- Single quotes
- Semicolons
- 2 spaces indentation
- 80 character line width

## Cara Menggunakan

1. **Push ke branch main** akan otomatis trigger workflow
2. **Job lint akan dijalankan pertama** - memeriksa kualitas kode
3. **Job test akan dijalankan setelah lint sukses** - menjalankan semua test
4. **Jika salah satu job gagal**, workflow akan berhenti

## Scripts Package.json yang Digunakan

```json
{
  "lint": "eslint backend/ --ext .js",
  "lint:fix": "eslint backend/ --ext .js --fix",
  "test:backend": "jest backend/tests/",
  "test:frontend": "cd frontend && npm test",
  "test": "npm run test:backend && npm run test:frontend"
}
```

## Status Badge
Anda dapat menambahkan badge status workflow ke README.md:

```markdown
![Node.js CI](https://github.com/alimurtadho/assingment_project_AI/workflows/Node.js%20Lint%20and%20Test/badge.svg)
```

## Monitoring dan Debugging

- Lihat tab **Actions** di GitHub repository untuk melihat status workflow
- Klik pada workflow run yang spesifik untuk melihat detail log
- Job yang gagal akan menampilkan error message yang detail

## Kustomisasi

Untuk mengubah workflow sesuai kebutuhan:
1. Edit file `.github/workflows/simple-ci.yml`
2. Tambah/ubah steps sesuai kebutuhan
3. Ubah trigger events jika diperlukan
4. Sesuaikan Node.js version jika perlu

## Keamanan

- Environment variables untuk secrets sudah dikonfigurasi
- Workflow menggunakan `npm ci` untuk installasi yang deterministik
- Dependencies di-cache untuk performa yang lebih baik
