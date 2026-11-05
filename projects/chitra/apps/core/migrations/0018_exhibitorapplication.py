from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0017_alter_images_image'),
    ]

    operations = [
        migrations.CreateModel(
            name='ExhibitorApplication',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('company_name', models.CharField(max_length=150, verbose_name='Bedriftsnavn')),
                ('org_number', models.CharField(blank=True, max_length=20, verbose_name='Org.nr')),
                ('category', models.CharField(choices=[('nybygg', 'Nybygg'), ('oppussing', 'Oppussing og renovering'), ('interior', 'Interiør og innredning'), ('tomt', 'Tomt og eiendom'), ('hage', 'Hage og uteliv'), ('annet', 'Annet')], max_length=20, verbose_name='Kategori')),
                ('contact_name', models.CharField(max_length=100, verbose_name='Kontaktperson')),
                ('email', models.EmailField(max_length=254, verbose_name='E-post')),
                ('phone', models.CharField(max_length=30, verbose_name='Telefon')),
                ('stand_size', models.CharField(choices=[('liten', 'Liten (ca. 6 m²)'), ('medium', 'Medium (ca. 12 m²)'), ('stor', 'Stor (18+ m²)'), ('usikker', 'Vet ikke ennå')], max_length=20, verbose_name='Ønsket standstørrelse')),
                ('message', models.TextField(blank=True, verbose_name='Melding')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Utstillersøknad',
                'verbose_name_plural': 'Utstillersøknader',
                'ordering': ['-created_at'],
            },
        ),
    ]
