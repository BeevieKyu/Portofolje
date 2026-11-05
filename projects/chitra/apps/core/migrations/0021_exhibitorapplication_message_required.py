from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0020_exhibitorapplication_event_required'),
    ]

    operations = [
        migrations.AlterField(
            model_name='exhibitorapplication',
            name='message',
            field=models.TextField(verbose_name='Hva skal markedsføres og selges'),
        ),
    ]
