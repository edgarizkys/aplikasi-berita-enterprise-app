import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await prisma.comment.deleteMany({});
    await prisma.article.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.author.deleteMany({});
    await prisma.user.deleteMany({});

    // Seed Users
    const hashedPassword = await bcryptjs.hash('password123', 10);

    const user1 = await prisma.user.create({
      data: {
        email: 'rina.wijaya@company.com',
        password: hashedPassword,
        name: 'Rina Wijaya',
        role: 'EDITOR',
        tenantId: 'default',
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: 'bambang.sutrisno@company.com',
        password: hashedPassword,
        name: 'Bambang Sutrisno',
        role: 'CONTRIBUTOR',
        tenantId: 'default',
      },
    });

    const user3 = await prisma.user.create({
      data: {
        email: 'admin@company.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        tenantId: 'default',
      },
    });

    // Seed Authors
    const author1 = await prisma.author.create({
      data: {
        name: 'Rina Wijaya',
        email: 'rina.wijaya@company.com',
        department: 'IT',
        bio: 'Editor Senior dengan 10 tahun pengalaman jurnalisme teknologi',
        role: 'Editor',
        tenantId: 'default',
        userId: user1.id,
      },
    });

    const author2 = await prisma.author.create({
      data: {
        name: 'Bambang Sutrisno',
        email: 'bambang.sutrisno@company.com',
        department: 'HR',
        bio: 'Spesialis komunikasi internal perusahaan',
        role: 'Contributor',
        tenantId: 'default',
        userId: user2.id,
      },
    });

    // Seed Categories
    const category1 = await prisma.category.create({
      data: {
        name: 'Teknologi',
        description: 'Berita seputar perkembangan teknologi dan inovasi',
        icon: '💻',
        tenantId: 'default',
      },
    });

    const category2 = await prisma.category.create({
      data: {
        name: 'HR',
        description: 'Berita terkait sumber daya manusia dan kesejahteraan karyawan',
        icon: '👥',
        tenantId: 'default',
      },
    });

    const category3 = await prisma.category.create({
      data: {
        name: 'Keuangan',
        description: 'Berita tentang kinerja keuangan dan investasi perusahaan',
        icon: '💰',
        tenantId: 'default',
      },
    });

    // Seed Articles
    const article1 = await prisma.article.create({
      data: {
        title: 'Transformasi Digital 2026',
        content:
          'Perusahaan kami meluncurkan inisiatif transformasi digital untuk meningkatkan efisiensi operasional. Program ini mencakup modernisasi infrastruktur IT, adopsi cloud computing, dan implementasi AI untuk otomasi proses bisnis. Dengan investasi sebesar 50 miliar rupiah, diharapkan produktivitas akan meningkat 40% dalam 18 bulan ke depan.',
        authorId: author1.id,
        categoryId: category1.id,
        status: 'PUBLISHED',
        publishedDate: new Date('2026-08-01'),
        views: 1250,
        featured: true,
        tenantId: 'default',
      },
    });

    const article2 = await prisma.article.create({
      data: {
        title: 'Program Kesejahteraan Karyawan Baru',
        content:
          'Manajemen meluncurkan program kesejahteraan komprehensif untuk semua karyawan. Program ini mencakup asuransi kesehatan premium, tunjangan kesejahteraan, program pengembangan karir, dan fasilitas rekreasi. Investasi tahunan untuk program ini adalah 25 miliar rupiah dengan harapan meningkatkan kepuasan karyawan dan mengurangi turnover rate.',
        authorId: author2.id,
        categoryId: category2.id,
        status: 'PUBLISHED',
        publishedDate: new Date('2026-07-31'),
        views: 890,
        featured: false,
        tenantId: 'default',
      },
    });

    const article3 = await prisma.article.create({
      data: {
        title: 'Laporan Kuartal II 2026 Menunjukkan Pertumbuhan Signifikan',
        content:
          'Hasil keuangan kuartal II tahun 2026 menunjukkan pertumbuhan revenue sebesar 28% year-over-year. EBITDA meningkat menjadi 15 miliar rupiah dengan margin sebesar 22%. Ekspansi ke pasar ASEAN berkontribusi signifikan terhadap pertumbuhan ini. Manajemen optimis untuk mencapai target tahunan sebesar 200 miliar rupiah.',
        authorId: author1.id,
        categoryId: category3.id,
        status: 'PUBLISHED',
        publishedDate: new Date('2026-07-28'),
        views: 2100,
        featured: true,
        tenantId: 'default',
      },
    });

    const article4 = await prisma.article.create({
      data: {
        title: 'Kolaborasi Strategis dengan Tech Giant Global',
        content:
          'Perusahaan kami menandatangani MOU dengan salah satu tech giant global untuk mengembangkan solusi enterprise. Kerjasama ini meliputi joint development, technology transfer, dan ecosystem partnership. Diharapkan partnership ini akan membuka peluang bisnis baru senilai 500 miliar rupiah dalam 2 tahun ke depan.',
        authorId: author1.id,
        categoryId: category1.id,
        status: 'DRAFT',
        publishedDate: null,
        views: 0,
        featured: false,
        tenantId: 'default',
      },
    });

    // Seed Comments
    const comment1 = await prisma.comment.create({
      data: {
        articleId: article1.id,
        authorName: 'Joko Susilo',
        content: 'Artikel yang sangat informatif dan relevan dengan perkembangan terkini',
        createdDate: new Date('2026-08-01'),
        approved: true,
        tenantId: 'default',
      },
    });

    const comment2 = await prisma.comment.create({
      data: {
        articleId: article2.id,
        authorName: 'Siti Nurhaliza',
        content: 'Program ini sangat membantu karyawan baru',
        createdDate: new Date('2026-07-31'),
        approved: true,
        tenantId: 'default',
      },
    });

    const comment3 = await prisma.comment.create({
      data: {
        articleId: article1.id,
        authorName: 'Adi Pratama',
        content: 'Kapan implementasi cloud computing dimulai?',
        createdDate: new Date('2026-08-02'),
        approved: false,
        tenantId: 'default',
      },
    });

    const comment4 = await prisma.comment.create({
      data: {
        articleId: article3.id,
        authorName: 'Maya Kusuma',
        content: 'Pertumbuhan yang impressive! Terus berkembang!',
        createdDate: new Date('2026-07-29'),
        approved: true,
        tenantId: 'default',
      },
    });

    console.log('✅ Seed completed successfully!');
    console.log('📊 Data summary:');
    console.log(`   Users: ${[user1, user2, user3].length}`);
    console.log(`   Authors: ${[author1, author2].length}`);
    console.log(`   Categories: ${[category1, category2, category3].length}`);
    console.log(`   Articles: ${[article1, article2, article3, article4].length}`);
    console.log(`   Comments: ${[comment1, comment2, comment3, comment4].length}`);
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();