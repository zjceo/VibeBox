import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TermsScreen: React.FC = () => {
  const navigation = useNavigation();

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
  }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const Paragraph: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Text style={styles.paragraph}>{children}</Text>
  );

  const BulletPoint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <View style={styles.bulletContainer}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Términos y Privacidad</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.intro}>
          <Text style={styles.introIcon}>📄</Text>
          <Text style={styles.introTitle}>Términos de Uso y Política de Privacidad</Text>
          <Text style={styles.introDate}>Última actualización: Diciembre 2024</Text>
        </View>

        {/* Terms of Service */}
        <Section title="1. Términos de Servicio">
          <Paragraph>
            Al utilizar VibeBox, aceptas los siguientes términos y condiciones de uso.
            VibeBox es un reproductor multimedia offline de código abierto diseñado
            para reproducir archivos de audio y video almacenados localmente en tu dispositivo.
          </Paragraph>
        </Section>

        <Section title="2. Uso de la Aplicación">
          <Paragraph>
            VibeBox está diseñado para uso personal y no comercial. Te comprometes a:
          </Paragraph>
          <BulletPoint>
            Utilizar la aplicación únicamente para reproducir contenido multimedia
            del cual tienes los derechos legales
          </BulletPoint>
          <BulletPoint>
            No utilizar la aplicación para actividades ilegales o no autorizadas
          </BulletPoint>
          <BulletPoint>
            Respetar las leyes de derechos de autor y propiedad intelectual
          </BulletPoint>
          <BulletPoint>
            No intentar modificar, descompilar o realizar ingeniería inversa
            de la aplicación con fines maliciosos
          </BulletPoint>
        </Section>

        <Section title="3. Privacidad y Datos">
          <Paragraph>
            VibeBox respeta tu privacidad y está comprometido con la protección
            de tus datos personales.
          </Paragraph>
          
          <Text style={styles.subsectionTitle}>3.1 Datos que NO recopilamos:</Text>
          <BulletPoint>
            No recopilamos información personal identificable
          </BulletPoint>
          <BulletPoint>
            No enviamos datos a servidores externos
          </BulletPoint>
          <BulletPoint>
            No rastreamos tu actividad ni comportamiento
          </BulletPoint>
          <BulletPoint>
            No compartimos información con terceros
          </BulletPoint>
          <BulletPoint>
            No utilizamos servicios de análisis o publicidad
          </BulletPoint>

          <Text style={styles.subsectionTitle}>3.2 Datos almacenados localmente:</Text>
          <BulletPoint>
            Metadatos de archivos multimedia (título, artista, duración)
          </BulletPoint>
          <BulletPoint>
            Listas de reproducción creadas por el usuario
          </BulletPoint>
          <BulletPoint>
            Preferencias de configuración de la aplicación
          </BulletPoint>
          <BulletPoint>
            Historial de reproducción local
          </BulletPoint>
          <BulletPoint>
            Favoritos marcados por el usuario
          </BulletPoint>
        </Section>

        <Section title="4. Permisos Requeridos">
          <Paragraph>
            VibeBox requiere los siguientes permisos para funcionar correctamente:
          </Paragraph>
          <BulletPoint>
            <Text style={styles.bold}>Almacenamiento:</Text> Para acceder y reproducir
            archivos multimedia almacenados en tu dispositivo
          </BulletPoint>
          <BulletPoint>
            <Text style={styles.bold}>Notificaciones:</Text> Para mostrar controles
            de reproducción en la barra de notificaciones
          </BulletPoint>
          <Paragraph>
            Todos los permisos se utilizan exclusivamente para las funcionalidades
            descritas y nunca para acceder a información no relacionada.
          </Paragraph>
        </Section>

        <Section title="5. Almacenamiento de Datos">
          <Paragraph>
            Todos los datos se almacenan localmente en tu dispositivo utilizando:
          </Paragraph>
          <BulletPoint>
            SQLite para la base de datos de metadatos
          </BulletPoint>
          <BulletPoint>
            AsyncStorage para preferencias de usuario
          </BulletPoint>
          <Paragraph>
            Puedes eliminar todos los datos en cualquier momento desde la configuración
            de la aplicación o desinstalando la app.
          </Paragraph>
        </Section>

        <Section title="6. Código Abierto">
          <Paragraph>
            VibeBox es un proyecto de código abierto. El código fuente está disponible
            públicamente en GitHub, lo que permite a cualquier persona revisar,
            auditar y verificar que la aplicación funciona exactamente como se describe.
          </Paragraph>
          <Paragraph>
            Repositorio: github.com/zjceo/VibeBox
          </Paragraph>
        </Section>

        <Section title="7. Limitación de Responsabilidad">
          <Paragraph>
            VibeBox se proporciona "tal cual" sin garantías de ningún tipo.
            No nos hacemos responsables de:
          </Paragraph>
          <BulletPoint>
            Pérdida de datos o archivos multimedia
          </BulletPoint>
          <BulletPoint>
            Problemas de compatibilidad con ciertos formatos de archivo
          </BulletPoint>
          <BulletPoint>
            Uso indebido de la aplicación por parte del usuario
          </BulletPoint>
          <BulletPoint>
            Violaciones de derechos de autor por contenido reproducido
          </BulletPoint>
        </Section>

        <Section title="8. Seguridad">
          <Paragraph>
            Nos esforzamos por mantener la seguridad de la aplicación mediante:
          </Paragraph>
          <BulletPoint>
            Actualizaciones regulares de dependencias
          </BulletPoint>
          <BulletPoint>
            Revisión de código y buenas prácticas de desarrollo
          </BulletPoint>
          <BulletPoint>
            Almacenamiento seguro de datos locales
          </BulletPoint>
          <BulletPoint>
            Sin conexiones a servidores externos
          </BulletPoint>
        </Section>

        <Section title="9. Derechos de Autor">
          <Paragraph>
            VibeBox no proporciona, aloja ni distribuye contenido multimedia.
            Eres responsable de asegurarte de que tienes los derechos legales
            para reproducir cualquier contenido que utilices con la aplicación.
          </Paragraph>
        </Section>

        <Section title="10. Modificaciones">
          <Paragraph>
            Nos reservamos el derecho de modificar estos términos en cualquier momento.
            Las modificaciones entrarán en vigor inmediatamente después de su publicación
            en la aplicación. El uso continuado de VibeBox después de dichas modificaciones
            constituye tu aceptación de los nuevos términos.
          </Paragraph>
        </Section>

        <Section title="11. Contacto">
          <Paragraph>
            Si tienes preguntas sobre estos términos o la política de privacidad,
            puedes contactarnos a través de:
          </Paragraph>
          <BulletPoint>
            GitHub Issues: github.com/zjceo/VibeBox/issues
          </BulletPoint>
          <BulletPoint>
            Repositorio: github.com/zjceo/VibeBox
          </BulletPoint>
        </Section>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerCard}>
            <Text style={styles.footerIcon}>✅</Text>
            <Text style={styles.footerTitle}>100% Privado</Text>
            <Text style={styles.footerText}>
              Sin recopilación de datos, sin rastreo, sin servidores externos
            </Text>
          </View>

          <View style={styles.footerCard}>
            <Text style={styles.footerIcon}>🔓</Text>
            <Text style={styles.footerTitle}>Código Abierto</Text>
            <Text style={styles.footerText}>
              Código fuente público y auditable en GitHub
            </Text>
          </View>

          <View style={styles.footerCard}>
            <Text style={styles.footerIcon}>💾</Text>
            <Text style={styles.footerTitle}>Offline First</Text>
            <Text style={styles.footerText}>
              Todos tus datos permanecen en tu dispositivo
            </Text>
          </View>
        </View>

        <View style={styles.bottomText}>
          <Text style={styles.bottomTextContent}>
            Al usar VibeBox, aceptas estos términos y política de privacidad
          </Text>
          <Text style={styles.copyright}>© 2024 VibeBox - MIT License</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  intro: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  introIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  introDate: {
    fontSize: 13,
    color: '#888888',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1DB954',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#1DB954',
    marginRight: 12,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 22,
  },
  bold: {
    fontWeight: '700',
    color: '#ffffff',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  footerCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  footerIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomText: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  bottomTextContent: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 12,
  },
  copyright: {
    fontSize: 12,
    color: '#666666',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default TermsScreen;
