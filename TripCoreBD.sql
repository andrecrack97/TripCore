USE [master]
GO
/****** Object:  Database [TripCoreBD]    Script Date: 9/6/2025 11:58:06 ******/
CREATE DATABASE [TripCoreBD]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'TripCoreBD', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL14.MSSQLSERVER\MSSQL\DATA\TripCoreBD.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'TripCoreBD_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL14.MSSQLSERVER\MSSQL\DATA\TripCoreBD_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
GO
ALTER DATABASE [TripCoreBD] SET COMPATIBILITY_LEVEL = 140
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [TripCoreBD].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [TripCoreBD] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [TripCoreBD] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [TripCoreBD] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [TripCoreBD] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [TripCoreBD] SET ARITHABORT OFF 
GO
ALTER DATABASE [TripCoreBD] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [TripCoreBD] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [TripCoreBD] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [TripCoreBD] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [TripCoreBD] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [TripCoreBD] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [TripCoreBD] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [TripCoreBD] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [TripCoreBD] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [TripCoreBD] SET  DISABLE_BROKER 
GO
ALTER DATABASE [TripCoreBD] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [TripCoreBD] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [TripCoreBD] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [TripCoreBD] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [TripCoreBD] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [TripCoreBD] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [TripCoreBD] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [TripCoreBD] SET RECOVERY FULL 
GO
ALTER DATABASE [TripCoreBD] SET  MULTI_USER 
GO
ALTER DATABASE [TripCoreBD] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [TripCoreBD] SET DB_CHAINING OFF 
GO
ALTER DATABASE [TripCoreBD] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [TripCoreBD] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [TripCoreBD] SET DELAYED_DURABILITY = DISABLED 
GO
EXEC sys.sp_db_vardecimal_storage_format N'TripCoreBD', N'ON'
GO
ALTER DATABASE [TripCoreBD] SET QUERY_STORE = OFF
GO
USE [TripCoreBD]
GO
/****** Object:  User [alumno]    Script Date: 9/6/2025 11:58:07 ******/
CREATE USER [alumno] FOR LOGIN [alumno] WITH DEFAULT_SCHEMA=[dbo]
GO
USE [TripCoreBD]
GO
/****** Object:  Sequence [dbo].[Seq_ActividadID]    Script Date: 9/6/2025 11:58:07 ******/
CREATE SEQUENCE [dbo].[Seq_ActividadID] 
 AS [bigint]
 START WITH 1
 INCREMENT BY 1
 MINVALUE -9223372036854775808
 MAXVALUE 9223372036854775807
 CACHE 
GO
USE [TripCoreBD]
GO
/****** Object:  Sequence [dbo].[Seq_AlojamientoID]    Script Date: 9/6/2025 11:58:07 ******/
CREATE SEQUENCE [dbo].[Seq_AlojamientoID] 
 AS [bigint]
 START WITH 1
 INCREMENT BY 1
 MINVALUE -9223372036854775808
 MAXVALUE 9223372036854775807
 CACHE 
GO
USE [TripCoreBD]
GO
/****** Object:  Sequence [dbo].[Seq_ReseñaID]    Script Date: 9/6/2025 11:58:07 ******/
CREATE SEQUENCE [dbo].[Seq_ReseñaID] 
 AS [bigint]
 START WITH 1
 INCREMENT BY 1
 MINVALUE -9223372036854775808
 MAXVALUE 9223372036854775807
 CACHE 
GO
USE [TripCoreBD]
GO
/****** Object:  Sequence [dbo].[Seq_TransporteID]    Script Date: 9/6/2025 11:58:07 ******/
CREATE SEQUENCE [dbo].[Seq_TransporteID] 
 AS [bigint]
 START WITH 1
 INCREMENT BY 1
 MINVALUE -9223372036854775808
 MAXVALUE 9223372036854775807
 CACHE 
GO
USE [TripCoreBD]
GO
/****** Object:  Sequence [dbo].[Seq_UsuarioID]    Script Date: 9/6/2025 11:58:07 ******/
CREATE SEQUENCE [dbo].[Seq_UsuarioID] 
 AS [bigint]
 START WITH 1
 INCREMENT BY 1
 MINVALUE -9223372036854775808
 MAXVALUE 9223372036854775807
 CACHE 
GO
USE [TripCoreBD]
GO
/****** Object:  Sequence [dbo].[Seq_ViajeID]    Script Date: 9/6/2025 11:58:07 ******/
CREATE SEQUENCE [dbo].[Seq_ViajeID] 
 AS [bigint]
 START WITH 1
 INCREMENT BY 1
 MINVALUE -9223372036854775808
 MAXVALUE 9223372036854775807
 CACHE 
GO
/****** Object:  Table [dbo].[Actividades]    Script Date: 9/6/2025 11:58:07 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Actividades](
	[id_actividad] [int] IDENTITY(1,1) NOT NULL,
	[id_viaje] [int] NOT NULL,
	[nombre] [nvarchar](100) NULL,
	[descripción] [nvarchar](max) NULL,
	[precio] [decimal](10, 2) NULL,
	[categoría] [nvarchar](50) NULL,
	[fecha] [date] NULL,
	[ubicación] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_actividad] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Alojamientos]    Script Date: 9/6/2025 11:58:07 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Alojamientos](
	[id_alojamiento] [int] IDENTITY(1,1) NOT NULL,
	[id_viaje] [int] NOT NULL,
	[nombre] [nvarchar](100) NULL,
	[proveedor] [nvarchar](50) NULL,
	[precio_por_noche] [decimal](10, 2) NULL,
	[tipo] [nvarchar](50) NULL,
	[link_externo] [nvarchar](max) NULL,
	[ubicación] [nvarchar](100) NULL,
	[fecha_checkin] [date] NULL,
	[fecha_checkout] [date] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_alojamiento] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CalendarioEventos]    Script Date: 9/6/2025 11:58:07 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CalendarioEventos](
	[id_evento] [int] IDENTITY(1,1) NOT NULL,
	[id_viaje] [int] NOT NULL,
	[tipo] [nvarchar](50) NULL,
	[nombre] [nvarchar](100) NULL,
	[fecha] [date] NULL,
	[hora] [time](7) NULL,
	[ubicación] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_evento] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ChatSoporte]    Script Date: 9/6/2025 11:58:07 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChatSoporte](
	[id_chat] [int] IDENTITY(1,1) NOT NULL,
	[id_usuario] [int] NOT NULL,
	[tipo_soporte] [nvarchar](50) NULL,
	[mensaje_usuario] [nvarchar](max) NULL,
	[respuesta_soporte] [nvarchar](max) NULL,
	[fecha] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_chat] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ChecklistValija]    Script Date: 9/6/2025 11:58:07 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChecklistValija](
	[id_valija] [int] IDENTITY(1,1) NOT NULL,
	[id_viaje] [int] NOT NULL,
	[item] [nvarchar](100) NULL,
	[marcado] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_valija] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Favoritos]    Script Date: 9/6/2025 11:58:07 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Favoritos](
	[id_favorito] [int] IDENTITY(1,1) NOT NULL,
	[id_usuario] [int] NOT NULL,
	[tipo_elemento] [nvarchar](50) NULL,
	[id_elemento] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_favorito] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Presupuestos]    Script Date: 9/6/2025 11:58:07 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Presupuestos](
	[id_presupuesto] [int] IDENTITY(1,1) NOT NULL,
	[id_viaje] [int] NOT NULL,
	[transporte_pct] [decimal](5, 2) NULL,
	[alojamiento_pct] [decimal](5, 2) NULL,
	[actividades_pct] [decimal](5, 2) NULL,
	[otros_pct] [decimal](5, 2) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_presupuesto] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Reseñas]    Script Date: 9/6/2025 11:58:07 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Reseñas](
	[id_reseña] [int] IDENTITY(1,1) NOT NULL,
	[id_usuario] [int] NOT NULL,
	[tipo_reseña] [nvarchar](50) NOT NULL,
	[id_elemento] [int] NOT NULL,
	[texto] [nvarchar](max) NULL,
	[calificación] [int] NULL,
	[fecha] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_reseña] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Transportes]    Script Date: 9/6/2025 11:58:07 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Transportes](
	[id_transporte] [int] IDENTITY(1,1) NOT NULL,
	[id_viaje] [int] NOT NULL,
	[tipo] [nvarchar](50) NULL,
	[origen] [nvarchar](100) NULL,
	[destino] [nvarchar](100) NULL,
	[fecha_salida] [datetime] NULL,
	[fecha_llegada] [datetime] NULL,
	[proveedor] [nvarchar](100) NULL,
	[precio] [decimal](10, 2) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_transporte] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Usuarios]    Script Date: 9/6/2025 11:58:07 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Usuarios](
	[id_usuario] [int] IDENTITY(1,1) NOT NULL,
	[nombre] [nvarchar](100) NULL,
	[email] [nvarchar](100) NOT NULL,
	[contraseña] [nvarchar](255) NOT NULL,
	[idioma] [nvarchar](50) NULL,
	[moneda_preferida] [nvarchar](10) NULL,
	[rol] [nvarchar](20) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_usuario] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Viajes]    Script Date: 9/6/2025 11:58:07 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Viajes](
	[id_viaje] [int] IDENTITY(1,1) NOT NULL,
	[id_usuario] [int] NOT NULL,
	[nombre_viaje] [nvarchar](100) NULL,
	[fecha_inicio] [date] NULL,
	[fecha_fin] [date] NULL,
	[destino_principal] [nvarchar](100) NULL,
	[tipo_viaje] [nvarchar](50) NULL,
	[presupuesto_total] [decimal](10, 2) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_viaje] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[Actividades] ON 
GO
INSERT [dbo].[Actividades] ([id_actividad], [id_viaje], [nombre], [descripción], [precio], [categoría], [fecha], [ubicación]) VALUES (1, 1, N'Tour Torre Eiffel', N'Entrada y visita guiada a la Torre Eiffel', CAST(30.00 AS Decimal(10, 2)), N'Cultural', CAST(N'2025-04-11' AS Date), N'París')
GO
INSERT [dbo].[Actividades] ([id_actividad], [id_viaje], [nombre], [descripción], [precio], [categoría], [fecha], [ubicación]) VALUES (2, 2, N'Caminata Machu Picchu', N'Excursión guiada al santuario', CAST(80.00 AS Decimal(10, 2)), N'Aventura', CAST(N'2025-07-05' AS Date), N'Cusco')
GO
INSERT [dbo].[Actividades] ([id_actividad], [id_viaje], [nombre], [descripción], [precio], [categoría], [fecha], [ubicación]) VALUES (3, 1, N'Tour Torre Eiffel', N'Entrada y visita guiada a la Torre Eiffel', CAST(30.00 AS Decimal(10, 2)), N'Cultural', CAST(N'2025-04-11' AS Date), N'París, Francia')
GO
INSERT [dbo].[Actividades] ([id_actividad], [id_viaje], [nombre], [descripción], [precio], [categoría], [fecha], [ubicación]) VALUES (4, 1, N'Crucero por el Sena', N'Paseo en barco por el río Sena', CAST(25.00 AS Decimal(10, 2)), N'Romántico', CAST(N'2025-04-13' AS Date), N'París, Francia')
GO
INSERT [dbo].[Actividades] ([id_actividad], [id_viaje], [nombre], [descripción], [precio], [categoría], [fecha], [ubicación]) VALUES (5, 2, N'Caminata a Machu Picchu', N'Excursión guiada al santuario histórico', CAST(80.00 AS Decimal(10, 2)), N'Aventura', CAST(N'2025-07-05' AS Date), N'Cusco, Perú')
GO
INSERT [dbo].[Actividades] ([id_actividad], [id_viaje], [nombre], [descripción], [precio], [categoría], [fecha], [ubicación]) VALUES (6, 2, N'Clase de cocina andina', N'Aprendé a cocinar platos típicos peruanos', CAST(50.00 AS Decimal(10, 2)), N'Cultural', CAST(N'2025-07-07' AS Date), N'Cusco, Perú')
GO
SET IDENTITY_INSERT [dbo].[Actividades] OFF
GO
SET IDENTITY_INSERT [dbo].[Alojamientos] ON 
GO
INSERT [dbo].[Alojamientos] ([id_alojamiento], [id_viaje], [nombre], [proveedor], [precio_por_noche], [tipo], [link_externo], [ubicación], [fecha_checkin], [fecha_checkout]) VALUES (1, 1, N'Hotel Lumière', N'Booking', CAST(120.00 AS Decimal(10, 2)), N'Hotel', N'https://booking.com/hotel-lumiere', N'París, Francia', CAST(N'2025-04-10' AS Date), CAST(N'2025-04-15' AS Date))
GO
INSERT [dbo].[Alojamientos] ([id_alojamiento], [id_viaje], [nombre], [proveedor], [precio_por_noche], [tipo], [link_externo], [ubicación], [fecha_checkin], [fecha_checkout]) VALUES (2, 2, N'Eco Lodge Cusco', N'Airbnb', CAST(65.00 AS Decimal(10, 2)), N'Lodge', N'https://airbnb.com/eco-lodge-cusco', N'Cusco, Perú', CAST(N'2025-07-01' AS Date), CAST(N'2025-07-10' AS Date))
GO
SET IDENTITY_INSERT [dbo].[Alojamientos] OFF
GO
SET IDENTITY_INSERT [dbo].[Reseñas] ON 
GO
INSERT [dbo].[Reseñas] ([id_reseña], [id_usuario], [tipo_reseña], [id_elemento], [texto], [calificación], [fecha]) VALUES (1, 1, N'alojamiento', 1, N'Muy buen hotel con excelente ubicación.', 5, CAST(N'2025-06-09T11:47:09.323' AS DateTime))
GO
INSERT [dbo].[Reseñas] ([id_reseña], [id_usuario], [tipo_reseña], [id_elemento], [texto], [calificación], [fecha]) VALUES (2, 2, N'transporte', 2, N'Viaje en bus cómodo y puntual.', 4, CAST(N'2025-06-09T11:47:09.323' AS DateTime))
GO
INSERT [dbo].[Reseñas] ([id_reseña], [id_usuario], [tipo_reseña], [id_elemento], [texto], [calificación], [fecha]) VALUES (3, 1, N'actividad', 1, N'Vista impresionante desde la Torre Eiffel.', 5, CAST(N'2025-06-09T11:47:09.323' AS DateTime))
GO
SET IDENTITY_INSERT [dbo].[Reseñas] OFF
GO
SET IDENTITY_INSERT [dbo].[Transportes] ON 
GO
INSERT [dbo].[Transportes] ([id_transporte], [id_viaje], [tipo], [origen], [destino], [fecha_salida], [fecha_llegada], [proveedor], [precio]) VALUES (1, 1, N'Avión', N'Madrid', N'París', CAST(N'2025-04-10T08:00:00.000' AS DateTime), CAST(N'2025-04-10T10:30:00.000' AS DateTime), N'Iberia', CAST(150.00 AS Decimal(10, 2)))
GO
INSERT [dbo].[Transportes] ([id_transporte], [id_viaje], [tipo], [origen], [destino], [fecha_salida], [fecha_llegada], [proveedor], [precio]) VALUES (2, 2, N'Bus', N'Lima', N'Cusco', CAST(N'2025-07-01T18:00:00.000' AS DateTime), CAST(N'2025-07-02T08:00:00.000' AS DateTime), N'PerúBus', CAST(45.00 AS Decimal(10, 2)))
GO
SET IDENTITY_INSERT [dbo].[Transportes] OFF
GO
SET IDENTITY_INSERT [dbo].[Usuarios] ON 
GO
INSERT [dbo].[Usuarios] ([id_usuario], [nombre], [email], [contraseña], [idioma], [moneda_preferida], [rol]) VALUES (1, N'Ana Torres', N'ana@example.com', N'AnaSegura2025!', N'es', N'EUR', N'turista')
GO
INSERT [dbo].[Usuarios] ([id_usuario], [nombre], [email], [contraseña], [idioma], [moneda_preferida], [rol]) VALUES (2, N'Luis Díaz', N'luis@example.com', N'ViajeSeguro123!', N'en', N'USD', N'turista')
GO
INSERT [dbo].[Usuarios] ([id_usuario], [nombre], [email], [contraseña], [idioma], [moneda_preferida], [rol]) VALUES (3, N'Admin Root', N'admin@tripcore.com', N'Root@Admin2025', N'es', N'USD', N'administrador')
GO
SET IDENTITY_INSERT [dbo].[Usuarios] OFF
GO
SET IDENTITY_INSERT [dbo].[Viajes] ON 
GO
INSERT [dbo].[Viajes] ([id_viaje], [id_usuario], [nombre_viaje], [fecha_inicio], [fecha_fin], [destino_principal], [tipo_viaje], [presupuesto_total]) VALUES (1, 1, N'Europa en Primavera', CAST(N'2025-04-10' AS Date), CAST(N'2025-04-24' AS Date), N'París', N'Cultural', CAST(2500.00 AS Decimal(10, 2)))
GO
INSERT [dbo].[Viajes] ([id_viaje], [id_usuario], [nombre_viaje], [fecha_inicio], [fecha_fin], [destino_principal], [tipo_viaje], [presupuesto_total]) VALUES (2, 2, N'Aventura Andina', CAST(N'2025-07-01' AS Date), CAST(N'2025-07-15' AS Date), N'Cusco', N'Aventura', CAST(1800.00 AS Decimal(10, 2)))
GO
SET IDENTITY_INSERT [dbo].[Viajes] OFF
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Usuarios__AB6E61649B41094E]    Script Date: 9/6/2025 11:58:07 ******/
ALTER TABLE [dbo].[Usuarios] ADD UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [dbo].[ChatSoporte] ADD  DEFAULT (getdate()) FOR [fecha]
GO
ALTER TABLE [dbo].[ChecklistValija] ADD  DEFAULT ((0)) FOR [marcado]
GO
ALTER TABLE [dbo].[Reseñas] ADD  DEFAULT (getdate()) FOR [fecha]
GO
ALTER TABLE [dbo].[Usuarios] ADD  DEFAULT ('turista') FOR [rol]
GO
ALTER TABLE [dbo].[Actividades]  WITH CHECK ADD  CONSTRAINT [FK__Actividad__id_vi__4316F928] FOREIGN KEY([id_viaje])
REFERENCES [dbo].[Viajes] ([id_viaje])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Actividades] CHECK CONSTRAINT [FK__Actividad__id_vi__4316F928]
GO
ALTER TABLE [dbo].[Alojamientos]  WITH CHECK ADD  CONSTRAINT [FK__Alojamien__id_vi__3D5E1FD2] FOREIGN KEY([id_viaje])
REFERENCES [dbo].[Viajes] ([id_viaje])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Alojamientos] CHECK CONSTRAINT [FK__Alojamien__id_vi__3D5E1FD2]
GO
ALTER TABLE [dbo].[CalendarioEventos]  WITH CHECK ADD  CONSTRAINT [FK__Calendari__id_vi__5812160E] FOREIGN KEY([id_viaje])
REFERENCES [dbo].[Viajes] ([id_viaje])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[CalendarioEventos] CHECK CONSTRAINT [FK__Calendari__id_vi__5812160E]
GO
ALTER TABLE [dbo].[ChatSoporte]  WITH CHECK ADD  CONSTRAINT [FK__ChatSopor__id_us__5165187F] FOREIGN KEY([id_usuario])
REFERENCES [dbo].[Usuarios] ([id_usuario])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ChatSoporte] CHECK CONSTRAINT [FK__ChatSopor__id_us__5165187F]
GO
ALTER TABLE [dbo].[ChecklistValija]  WITH CHECK ADD  CONSTRAINT [FK__Checklist__id_vi__5535A963] FOREIGN KEY([id_viaje])
REFERENCES [dbo].[Viajes] ([id_viaje])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ChecklistValija] CHECK CONSTRAINT [FK__Checklist__id_vi__5535A963]
GO
ALTER TABLE [dbo].[Favoritos]  WITH CHECK ADD  CONSTRAINT [FK__Favoritos__id_us__48CFD27E] FOREIGN KEY([id_usuario])
REFERENCES [dbo].[Usuarios] ([id_usuario])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Favoritos] CHECK CONSTRAINT [FK__Favoritos__id_us__48CFD27E]
GO
ALTER TABLE [dbo].[Presupuestos]  WITH CHECK ADD  CONSTRAINT [FK__Presupues__id_vi__45F365D3] FOREIGN KEY([id_viaje])
REFERENCES [dbo].[Viajes] ([id_viaje])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Presupuestos] CHECK CONSTRAINT [FK__Presupues__id_vi__45F365D3]
GO
ALTER TABLE [dbo].[Reseñas]  WITH CHECK ADD  CONSTRAINT [FK__Reseñas__id_usua__4D94879B] FOREIGN KEY([id_usuario])
REFERENCES [dbo].[Usuarios] ([id_usuario])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Reseñas] CHECK CONSTRAINT [FK__Reseñas__id_usua__4D94879B]
GO
ALTER TABLE [dbo].[Transportes]  WITH CHECK ADD  CONSTRAINT [FK__Transport__id_vi__403A8C7D] FOREIGN KEY([id_viaje])
REFERENCES [dbo].[Viajes] ([id_viaje])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Transportes] CHECK CONSTRAINT [FK__Transport__id_vi__403A8C7D]
GO
ALTER TABLE [dbo].[Viajes]  WITH CHECK ADD  CONSTRAINT [FK__Viajes__id_usuar__3A81B327] FOREIGN KEY([id_usuario])
REFERENCES [dbo].[Usuarios] ([id_usuario])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Viajes] CHECK CONSTRAINT [FK__Viajes__id_usuar__3A81B327]
GO
ALTER TABLE [dbo].[Reseñas]  WITH CHECK ADD CHECK  (([calificación]>=(1) AND [calificación]<=(5)))
GO
USE [master]
GO
ALTER DATABASE [TripCoreBD] SET  READ_WRITE 
GO
