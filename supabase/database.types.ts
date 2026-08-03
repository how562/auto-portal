/**
 * Generated Supabase Database types for Auto Portal.
 * Source: Supabase MCP generate_typescript_types (project faantdhcxnnuwuwkaxbq).
 * Regenerated after vAuto schema migrations on 2026-08-03.
 * Not wired into tsconfig by default — import explicitly if needed.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      branding_colors: {
        Row: {
          category: string
          created_at: string
          hex: string
          id: string
          is_active: boolean
          name: string
          rgb: string | null
          sort_order: number
          token_name: string | null
          updated_at: string
          usage_note: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          hex: string
          id?: string
          is_active?: boolean
          name: string
          rgb?: string | null
          sort_order?: number
          token_name?: string | null
          updated_at?: string
          usage_note?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          hex?: string
          id?: string
          is_active?: boolean
          name?: string
          rgb?: string | null
          sort_order?: number
          token_name?: string | null
          updated_at?: string
          usage_note?: string | null
        }
        Relationships: []
      }
      branding_dealer_references: {
        Row: {
          compliance_notes: string | null
          created_at: string
          disclaimer_notes: string | null
          id: string
          is_active: boolean
          known_restrictions: string | null
          logo_reference_url: string | null
          oem: string
          required_ad_elements: string | null
          sort_order: number
          store_name: string
          updated_at: string
        }
        Insert: {
          compliance_notes?: string | null
          created_at?: string
          disclaimer_notes?: string | null
          id?: string
          is_active?: boolean
          known_restrictions?: string | null
          logo_reference_url?: string | null
          oem: string
          required_ad_elements?: string | null
          sort_order?: number
          store_name: string
          updated_at?: string
        }
        Update: {
          compliance_notes?: string | null
          created_at?: string
          disclaimer_notes?: string | null
          id?: string
          is_active?: boolean
          known_restrictions?: string | null
          logo_reference_url?: string | null
          oem?: string
          required_ad_elements?: string | null
          sort_order?: number
          store_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      branding_disclaimers: {
        Row: {
          applies_to: string
          body: string
          created_at: string
          dealership_name: string | null
          disclaimer_type: string
          effective_date: string | null
          expiration_date: string | null
          id: string
          is_active: boolean
          is_required: boolean
          oem: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          applies_to?: string
          body: string
          created_at?: string
          dealership_name?: string | null
          disclaimer_type?: string
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          oem?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          applies_to?: string
          body?: string
          created_at?: string
          dealership_name?: string | null
          disclaimer_type?: string
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          oem?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      branding_logos: {
        Row: {
          alt_text: string | null
          created_at: string
          file_url: string
          id: string
          is_active: boolean
          logo_type: string
          name: string
          sort_order: number
          updated_at: string
          usage_notes: string | null
          variant: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_url: string
          id?: string
          is_active?: boolean
          logo_type: string
          name: string
          sort_order?: number
          updated_at?: string
          usage_notes?: string | null
          variant?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_url?: string
          id?: string
          is_active?: boolean
          logo_type?: string
          name?: string
          sort_order?: number
          updated_at?: string
          usage_notes?: string | null
          variant?: string
        }
        Relationships: []
      }
      branding_messaging: {
        Row: {
          applies_to: string
          body: string
          category: string
          created_at: string
          dealership_name: string | null
          id: string
          is_active: boolean
          oem: string | null
          sort_order: number
          title: string
          updated_at: string
          usage_notes: string | null
        }
        Insert: {
          applies_to?: string
          body: string
          category?: string
          created_at?: string
          dealership_name?: string | null
          id?: string
          is_active?: boolean
          oem?: string | null
          sort_order?: number
          title: string
          updated_at?: string
          usage_notes?: string | null
        }
        Update: {
          applies_to?: string
          body?: string
          category?: string
          created_at?: string
          dealership_name?: string | null
          id?: string
          is_active?: boolean
          oem?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
          usage_notes?: string | null
        }
        Relationships: []
      }
      branding_typography: {
        Row: {
          created_at: string
          example_preview: string | null
          fallback_stack: string | null
          font_family: string
          font_role: string
          font_weights: string | null
          id: string
          is_active: boolean
          sort_order: number
          updated_at: string
          usage_notes: string | null
        }
        Insert: {
          created_at?: string
          example_preview?: string | null
          fallback_stack?: string | null
          font_family: string
          font_role: string
          font_weights?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          updated_at?: string
          usage_notes?: string | null
        }
        Update: {
          created_at?: string
          example_preview?: string | null
          fallback_stack?: string | null
          font_family?: string
          font_role?: string
          font_weights?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          updated_at?: string
          usage_notes?: string | null
        }
        Relationships: []
      }
      cavender_stories: {
        Row: {
          author: string
          body: Json
          category: string
          cover_image: string
          cover_image_alt: string
          created_at: string
          excerpt: string
          external_url: string | null
          featured: boolean
          id: string
          published_at: string
          read_time: string
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          body?: Json
          category: string
          cover_image?: string
          cover_image_alt?: string
          created_at?: string
          excerpt?: string
          external_url?: string | null
          featured?: boolean
          id?: string
          published_at?: string
          read_time?: string
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          body?: Json
          category?: string
          cover_image?: string
          cover_image_alt?: string
          created_at?: string
          excerpt?: string
          external_url?: string | null
          featured?: boolean
          id?: string
          published_at?: string
          read_time?: string
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      collection_rules: {
        Row: {
          collection_id: string | null
          created_at: string
          field: string
          id: string
          operator: string
          value: string
        }
        Insert: {
          collection_id?: string | null
          created_at?: string
          field: string
          id?: string
          operator: string
          value: string
        }
        Update: {
          collection_id?: string | null
          created_at?: string
          field?: string
          id?: string
          operator?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_rules_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          dealer_group_id: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          store_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dealer_group_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          store_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dealer_group_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          store_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_dealer_group_id_fkey"
            columns: ["dealer_group_id"]
            isOneToOne: false
            referencedRelation: "dealer_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_the_cavenders_submissions: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          location: string
          message: string
          phone: string
          reviewed: boolean
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          location: string
          message: string
          phone: string
          reviewed?: boolean
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          location?: string
          message?: string
          phone?: string
          reviewed?: boolean
          status?: string
        }
        Relationships: []
      }
      dealer_groups: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      dealership_drivecentric_config: {
        Row: {
          created_at: string
          dealership_name: string | null
          drivecentric_email: string
          id: string
          is_active: boolean
          store_id: string
        }
        Insert: {
          created_at?: string
          dealership_name?: string | null
          drivecentric_email: string
          id?: string
          is_active?: boolean
          store_id: string
        }
        Update: {
          created_at?: string
          dealership_name?: string | null
          drivecentric_email?: string
          id?: string
          is_active?: boolean
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dealership_drivecentric_config_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      dealership_inventory_settings: {
        Row: {
          active_inventory_feed_source_id: string | null
          store_id: string
          updated_at: string
        }
        Insert: {
          active_inventory_feed_source_id?: string | null
          store_id: string
          updated_at?: string
        }
        Update: {
          active_inventory_feed_source_id?: string | null
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dealership_inventory_settings_active_inventory_feed_source_fkey"
            columns: ["active_inventory_feed_source_id"]
            isOneToOne: false
            referencedRelation: "inventory_feed_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealership_inventory_settings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_field_mappings: {
        Row: {
          created_at: string
          feed_source_id: string | null
          id: string
          mapped_field: string
          source_field: string
        }
        Insert: {
          created_at?: string
          feed_source_id?: string | null
          id?: string
          mapped_field: string
          source_field: string
        }
        Update: {
          created_at?: string
          feed_source_id?: string | null
          id?: string
          mapped_field?: string
          source_field?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_field_mappings_feed_source_id_fkey"
            columns: ["feed_source_id"]
            isOneToOne: false
            referencedRelation: "feed_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_file_mappings: {
        Row: {
          created_at: string
          file_pattern: string
          id: string
          inventory_provider: string | null
          is_active: boolean
          notes: string | null
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_pattern: string
          id?: string
          inventory_provider?: string | null
          is_active?: boolean
          notes?: string | null
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_pattern?: string
          id?: string
          inventory_provider?: string | null
          is_active?: boolean
          notes?: string | null
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_file_mappings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_import_run_items: {
        Row: {
          action: string | null
          created_at: string
          error_message: string | null
          file_name: string | null
          id: string
          import_run_id: string | null
          message: string | null
          rows_processed: number | null
          run_id: string | null
          skip_reason: string | null
          skipped: number | null
          status: string | null
          stock_number: string | null
          store_id: string | null
          store_mapping_source: string | null
          store_name: string | null
          upserted: number | null
          vehicle_id: string | null
          vin: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string
          error_message?: string | null
          file_name?: string | null
          id?: string
          import_run_id?: string | null
          message?: string | null
          rows_processed?: number | null
          run_id?: string | null
          skip_reason?: string | null
          skipped?: number | null
          status?: string | null
          stock_number?: string | null
          store_id?: string | null
          store_mapping_source?: string | null
          store_name?: string | null
          upserted?: number | null
          vehicle_id?: string | null
          vin?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string
          error_message?: string | null
          file_name?: string | null
          id?: string
          import_run_id?: string | null
          message?: string | null
          rows_processed?: number | null
          run_id?: string | null
          skip_reason?: string | null
          skipped?: number | null
          status?: string | null
          stock_number?: string | null
          store_id?: string | null
          store_mapping_source?: string | null
          store_name?: string | null
          upserted?: number | null
          vehicle_id?: string | null
          vin?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_import_run_items_import_run_id_fkey"
            columns: ["import_run_id"]
            isOneToOne: false
            referencedRelation: "feed_import_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_import_run_items_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "feed_import_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_import_run_items_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_import_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_log: string | null
          error_message: string | null
          feed_source_id: string | null
          files_failed: number | null
          files_processed: number | null
          files_skipped: number | null
          files_succeeded: number | null
          id: string
          inventory_feed_source_id: string | null
          inventory_provider: string | null
          new_records: number
          removed_records: number
          run_kind: string | null
          started_at: string | null
          status: string
          store_id: string | null
          total_records: number
          total_upserted: number | null
          trigger_source: string | null
          updated_records: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_log?: string | null
          error_message?: string | null
          feed_source_id?: string | null
          files_failed?: number | null
          files_processed?: number | null
          files_skipped?: number | null
          files_succeeded?: number | null
          id?: string
          inventory_feed_source_id?: string | null
          inventory_provider?: string | null
          new_records?: number
          removed_records?: number
          run_kind?: string | null
          started_at?: string | null
          status?: string
          store_id?: string | null
          total_records?: number
          total_upserted?: number | null
          trigger_source?: string | null
          updated_records?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_log?: string | null
          error_message?: string | null
          feed_source_id?: string | null
          files_failed?: number | null
          files_processed?: number | null
          files_skipped?: number | null
          files_succeeded?: number | null
          id?: string
          inventory_feed_source_id?: string | null
          inventory_provider?: string | null
          new_records?: number
          removed_records?: number
          run_kind?: string | null
          started_at?: string | null
          status?: string
          store_id?: string | null
          total_records?: number
          total_upserted?: number | null
          trigger_source?: string | null
          updated_records?: number
        }
        Relationships: [
          {
            foreignKeyName: "feed_import_runs_feed_source_id_fkey"
            columns: ["feed_source_id"]
            isOneToOne: false
            referencedRelation: "feed_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_import_runs_inventory_feed_source_id_fkey"
            columns: ["inventory_feed_source_id"]
            isOneToOne: false
            referencedRelation: "inventory_feed_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_import_runs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_import_schedules: {
        Row: {
          created_at: string
          cron_expression: string | null
          id: string
          inventory_provider: string
          is_enabled: boolean
          last_triggered_at: string | null
          next_run_at: string | null
          store_id: string | null
          trigger_source: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cron_expression?: string | null
          id?: string
          inventory_provider: string
          is_enabled?: boolean
          last_triggered_at?: string | null
          next_run_at?: string | null
          store_id?: string | null
          trigger_source?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cron_expression?: string | null
          id?: string
          inventory_provider?: string
          is_enabled?: boolean
          last_triggered_at?: string | null
          next_run_at?: string | null
          store_id?: string | null
          trigger_source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_import_schedules_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_sources: {
        Row: {
          created_at: string
          feed_type: string
          feed_url: string | null
          id: string
          is_active: boolean
          name: string
          store_id: string | null
        }
        Insert: {
          created_at?: string
          feed_type: string
          feed_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          store_id?: string | null
        }
        Update: {
          created_at?: string
          feed_type?: string
          feed_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_sources_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_layout_settings: {
        Row: {
          hidden_sections: Json
          id: string
          section_order: Json
          updated_at: string
        }
        Insert: {
          hidden_sections?: Json
          id?: string
          section_order?: Json
          updated_at?: string
        }
        Update: {
          hidden_sections?: Json
          id?: string
          section_order?: Json
          updated_at?: string
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          collection_id: string | null
          created_at: string
          dealer_group_id: string | null
          id: string
          is_active: boolean
          section_type: string
          sort_order: number
          subtitle: string | null
          subtitle_es: string | null
          title: string | null
          title_es: string | null
          updated_at: string
        }
        Insert: {
          collection_id?: string | null
          created_at?: string
          dealer_group_id?: string | null
          id?: string
          is_active?: boolean
          section_type: string
          sort_order?: number
          subtitle?: string | null
          subtitle_es?: string | null
          title?: string | null
          title_es?: string | null
          updated_at?: string
        }
        Update: {
          collection_id?: string | null
          created_at?: string
          dealer_group_id?: string | null
          id?: string
          is_active?: boolean
          section_type?: string
          sort_order?: number
          subtitle?: string | null
          subtitle_es?: string | null
          title?: string | null
          title_es?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homepage_sections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homepage_sections_dealer_group_id_fkey"
            columns: ["dealer_group_id"]
            isOneToOne: false
            referencedRelation: "dealer_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_feed_sources: {
        Row: {
          created_at: string
          id: string
          label: string
          last_error_message: string | null
          last_import_at: string | null
          last_intake_at: string | null
          last_vehicle_count: number
          provider: string
          status: string
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          last_error_message?: string | null
          last_import_at?: string | null
          last_intake_at?: string | null
          last_vehicle_count?: number
          provider: string
          status?: string
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          last_error_message?: string | null
          last_import_at?: string | null
          last_intake_at?: string | null
          last_vehicle_count?: number
          provider?: string
          status?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_feed_sources_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_import_failures: {
        Row: {
          created_at: string
          error_code: string | null
          error_message: string
          failure_scope: string
          feed_import_run_id: string | null
          file_name: string | null
          id: string
          import_key: string | null
          inventory_provider: string
          raw_feed_archive_id: string | null
          row_number: number | null
          stock_number: string | null
          store_id: string | null
          vin: string | null
        }
        Insert: {
          created_at?: string
          error_code?: string | null
          error_message: string
          failure_scope: string
          feed_import_run_id?: string | null
          file_name?: string | null
          id?: string
          import_key?: string | null
          inventory_provider: string
          raw_feed_archive_id?: string | null
          row_number?: number | null
          stock_number?: string | null
          store_id?: string | null
          vin?: string | null
        }
        Update: {
          created_at?: string
          error_code?: string | null
          error_message?: string
          failure_scope?: string
          feed_import_run_id?: string | null
          file_name?: string | null
          id?: string
          import_key?: string | null
          inventory_provider?: string
          raw_feed_archive_id?: string | null
          row_number?: number | null
          stock_number?: string | null
          store_id?: string | null
          vin?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_import_failures_feed_import_run_id_fkey"
            columns: ["feed_import_run_id"]
            isOneToOne: false
            referencedRelation: "feed_import_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_import_failures_raw_feed_archive_id_fkey"
            columns: ["raw_feed_archive_id"]
            isOneToOne: false
            referencedRelation: "raw_feed_archives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_import_failures_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_snapshots: {
        Row: {
          active_vehicle_count: number
          created_at: string
          feed_import_run_id: string | null
          id: string
          inventory_provider: string
          snapshot_at: string
          storage_ref: string | null
          store_id: string
        }
        Insert: {
          active_vehicle_count?: number
          created_at?: string
          feed_import_run_id?: string | null
          id?: string
          inventory_provider: string
          snapshot_at?: string
          storage_ref?: string | null
          store_id: string
        }
        Update: {
          active_vehicle_count?: number
          created_at?: string
          feed_import_run_id?: string | null
          id?: string
          inventory_provider?: string
          snapshot_at?: string
          storage_ref?: string | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_snapshots_feed_import_run_id_fkey"
            columns: ["feed_import_run_id"]
            isOneToOne: false
            referencedRelation: "feed_import_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_snapshots_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_source_switch_log: {
        Row: {
          acknowledged_mismatch: boolean
          from_feed_source_id: string | null
          from_provider: string | null
          homenet_count_at_switch: number
          id: string
          store_id: string
          switched_at: string
          to_feed_source_id: string
          to_provider: string
          vauto_count_at_switch: number
        }
        Insert: {
          acknowledged_mismatch?: boolean
          from_feed_source_id?: string | null
          from_provider?: string | null
          homenet_count_at_switch?: number
          id?: string
          store_id: string
          switched_at?: string
          to_feed_source_id: string
          to_provider: string
          vauto_count_at_switch?: number
        }
        Update: {
          acknowledged_mismatch?: boolean
          from_feed_source_id?: string | null
          from_provider?: string | null
          homenet_count_at_switch?: number
          id?: string
          store_id?: string
          switched_at?: string
          to_feed_source_id?: string
          to_provider?: string
          vauto_count_at_switch?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_source_switch_log_from_feed_source_id_fkey"
            columns: ["from_feed_source_id"]
            isOneToOne: false
            referencedRelation: "inventory_feed_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_source_switch_log_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_source_switch_log_to_feed_source_id_fkey"
            columns: ["to_feed_source_id"]
            isOneToOne: false
            referencedRelation: "inventory_feed_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_delivery_queue: {
        Row: {
          attempts: number
          created_at: string
          destination: string
          id: string
          last_error: string | null
          lead_id: string
          payload: Json | null
          status: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          destination?: string
          id?: string
          last_error?: string | null
          lead_id: string
          payload?: Json | null
          status?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          destination?: string
          id?: string
          last_error?: string | null
          lead_id?: string
          payload?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_delivery_queue_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          email: string | null
          id: string
          lead_action: string | null
          message: string | null
          name: string
          phone: string | null
          preferred_contact_method: string | null
          shopper_intent: string | null
          source_page: string | null
          status: string
          store_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          lead_action?: string | null
          message?: string | null
          name: string
          phone?: string | null
          preferred_contact_method?: string | null
          shopper_intent?: string | null
          source_page?: string | null
          status?: string
          store_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          lead_action?: string | null
          message?: string | null
          name?: string
          phone?: string | null
          preferred_contact_method?: string | null
          shopper_intent?: string | null
          source_page?: string | null
          status?: string
          store_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      link_audit: {
        Row: {
          created_at: string
          group_name: string
          id: string
          is_active: boolean
          label: string
          link_type: string
          notes: string | null
          sort_order: number
          status: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          group_name: string
          id?: string
          is_active?: boolean
          label: string
          link_type?: string
          notes?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          group_name?: string
          id?: string
          is_active?: boolean
          label?: string
          link_type?: string
          notes?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      navigation_items: {
        Row: {
          column_group: string | null
          created_at: string
          cta_style: string
          dropdown_behavior: string
          id: string
          is_active: boolean
          label: string
          label_es: string | null
          menu_id: string
          opens_new_tab: boolean
          page_id: string | null
          parent_id: string | null
          sort_order: number
          url: string
        }
        Insert: {
          column_group?: string | null
          created_at?: string
          cta_style?: string
          dropdown_behavior?: string
          id?: string
          is_active?: boolean
          label: string
          label_es?: string | null
          menu_id: string
          opens_new_tab?: boolean
          page_id?: string | null
          parent_id?: string | null
          sort_order?: number
          url: string
        }
        Update: {
          column_group?: string | null
          created_at?: string
          cta_style?: string
          dropdown_behavior?: string
          id?: string
          is_active?: boolean
          label?: string
          label_es?: string | null
          menu_id?: string
          opens_new_tab?: boolean
          page_id?: string | null
          parent_id?: string | null
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "navigation_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "navigation_menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "navigation_items_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "site_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "navigation_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_menus: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          location: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          location: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          location?: string
          name?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          archived: boolean
          body: string
          created_at: string
          id: string
          pinned: boolean
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived?: boolean
          body?: string
          created_at?: string
          id?: string
          pinned?: boolean
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived?: boolean
          body?: string
          created_at?: string
          id?: string
          pinned?: boolean
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      page_sections: {
        Row: {
          body: string | null
          body_es: string | null
          content: string | null
          created_at: string
          cta_text: string | null
          cta_text_es: string | null
          cta_url: string | null
          cta_url_es: string | null
          eyebrow: string | null
          headline: string | null
          headline_es: string | null
          id: string
          image_url: string | null
          image_url_es: string | null
          is_active: boolean
          layout_variant: string | null
          page_id: string
          section_type: string
          settings: Json
          sort_order: number
          subheadline: string | null
          subheadline_es: string | null
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          body_es?: string | null
          content?: string | null
          created_at?: string
          cta_text?: string | null
          cta_text_es?: string | null
          cta_url?: string | null
          cta_url_es?: string | null
          eyebrow?: string | null
          headline?: string | null
          headline_es?: string | null
          id?: string
          image_url?: string | null
          image_url_es?: string | null
          is_active?: boolean
          layout_variant?: string | null
          page_id: string
          section_type: string
          settings?: Json
          sort_order?: number
          subheadline?: string | null
          subheadline_es?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          body_es?: string | null
          content?: string | null
          created_at?: string
          cta_text?: string | null
          cta_text_es?: string | null
          cta_url?: string | null
          cta_url_es?: string | null
          eyebrow?: string | null
          headline?: string | null
          headline_es?: string | null
          id?: string
          image_url?: string | null
          image_url_es?: string | null
          is_active?: boolean
          layout_variant?: string | null
          page_id?: string
          section_type?: string
          settings?: Json
          sort_order?: number
          subheadline?: string | null
          subheadline_es?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "site_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_cta_settings: {
        Row: {
          created_at: string | null
          cta_key: string
          id: string
          label: string
          label_es: string | null
          sublabel: string | null
          sublabel_es: string | null
          url: string | null
          url_es: string | null
        }
        Insert: {
          created_at?: string | null
          cta_key: string
          id?: string
          label: string
          label_es?: string | null
          sublabel?: string | null
          sublabel_es?: string | null
          url?: string | null
          url_es?: string | null
        }
        Update: {
          created_at?: string | null
          cta_key?: string
          id?: string
          label?: string
          label_es?: string | null
          sublabel?: string | null
          sublabel_es?: string | null
          url?: string | null
          url_es?: string | null
        }
        Relationships: []
      }
      portal_managed_links: {
        Row: {
          created_at: string
          is_active: boolean
          is_group: boolean
          label: string
          label_es: string | null
          link_key: string
          link_type: string
          menu_location: string | null
          opens_new_tab: boolean
          parent_key: string | null
          sort_order: number
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          is_active?: boolean
          is_group?: boolean
          label: string
          label_es?: string | null
          link_key: string
          link_type: string
          menu_location?: string | null
          opens_new_tab?: boolean
          parent_key?: string | null
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          is_active?: boolean
          is_group?: boolean
          label?: string
          label_es?: string | null
          link_key?: string
          link_type?: string
          menu_location?: string | null
          opens_new_tab?: boolean
          parent_key?: string | null
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_managed_links_parent_key_fkey"
            columns: ["parent_key"]
            isOneToOne: false
            referencedRelation: "portal_managed_links"
            referencedColumns: ["link_key"]
          },
        ]
      }
      portal_pricing_mathbox_config: {
        Row: {
          applies_to: string
          collapse_by_default: boolean | null
          created_at: string
          disclaimer: string | null
          disclaimer_key: string | null
          disclaimer_text: string | null
          display_order: number | null
          group_name: string
          id: string
          is_active: boolean
          is_conditional: boolean
          label: string
          label_es: string | null
          line_key: string
          line_type: string
          show_when_zero: boolean | null
          sort_order: number
          source_key: string | null
          updated_at: string
        }
        Insert: {
          applies_to?: string
          collapse_by_default?: boolean | null
          created_at?: string
          disclaimer?: string | null
          disclaimer_key?: string | null
          disclaimer_text?: string | null
          display_order?: number | null
          group_name?: string
          id?: string
          is_active?: boolean
          is_conditional?: boolean
          label: string
          label_es?: string | null
          line_key: string
          line_type?: string
          show_when_zero?: boolean | null
          sort_order?: number
          source_key?: string | null
          updated_at?: string
        }
        Update: {
          applies_to?: string
          collapse_by_default?: boolean | null
          created_at?: string
          disclaimer?: string | null
          disclaimer_key?: string | null
          disclaimer_text?: string | null
          display_order?: number | null
          group_name?: string
          id?: string
          is_active?: boolean
          is_conditional?: boolean
          label?: string
          label_es?: string | null
          line_key?: string
          line_type?: string
          show_when_zero?: boolean | null
          sort_order?: number
          source_key?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      portal_text_settings: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          label_en: string
          label_es: string | null
          text_key: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          label_en: string
          label_es?: string | null
          text_key: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          label_en?: string
          label_es?: string | null
          text_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      portal_vdp_cta_settings: {
        Row: {
          action_key: string
          applies_to: string
          created_at: string
          is_active: boolean
          label: string
          label_es: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          action_key: string
          applies_to?: string
          created_at?: string
          is_active?: boolean
          label: string
          label_es?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          action_key?: string
          applies_to?: string
          created_at?: string
          is_active?: boolean
          label?: string
          label_es?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      raw_feed_archives: {
        Row: {
          archived_at: string
          byte_size: number | null
          checksum_sha256: string | null
          created_at: string
          error_message: string | null
          feed_import_run_id: string | null
          file_format: string | null
          file_name: string
          id: string
          inventory_feed_source_id: string | null
          inventory_provider: string
          metadata: Json
          parse_status: string
          received_at: string
          remote_path: string | null
          storage_kind: string
          storage_path: string | null
          store_id: string | null
        }
        Insert: {
          archived_at?: string
          byte_size?: number | null
          checksum_sha256?: string | null
          created_at?: string
          error_message?: string | null
          feed_import_run_id?: string | null
          file_format?: string | null
          file_name: string
          id?: string
          inventory_feed_source_id?: string | null
          inventory_provider: string
          metadata?: Json
          parse_status?: string
          received_at?: string
          remote_path?: string | null
          storage_kind?: string
          storage_path?: string | null
          store_id?: string | null
        }
        Update: {
          archived_at?: string
          byte_size?: number | null
          checksum_sha256?: string | null
          created_at?: string
          error_message?: string | null
          feed_import_run_id?: string | null
          file_format?: string | null
          file_name?: string
          id?: string
          inventory_feed_source_id?: string | null
          inventory_provider?: string
          metadata?: Json
          parse_status?: string
          received_at?: string
          remote_path?: string | null
          storage_kind?: string
          storage_path?: string | null
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_feed_archives_feed_import_run_id_fkey"
            columns: ["feed_import_run_id"]
            isOneToOne: false
            referencedRelation: "feed_import_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raw_feed_archives_inventory_feed_source_id_fkey"
            columns: ["inventory_feed_source_id"]
            isOneToOne: false
            referencedRelation: "inventory_feed_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raw_feed_archives_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      site_pages: {
        Row: {
          created_at: string
          id: string
          inventory_preset: Json | null
          meta_description: string | null
          page_content: Json | null
          page_type: string
          slug: string
          status: string
          store_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_preset?: Json | null
          meta_description?: string | null
          page_content?: Json | null
          page_type?: string
          slug: string
          status?: string
          store_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          inventory_preset?: Json | null
          meta_description?: string | null
          page_content?: Json | null
          page_type?: string
          slug?: string
          status?: string
          store_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_pages_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_match_config: {
        Row: {
          default_limit: number | null
          id: string
          show_match_reason: boolean | null
          updated_at: string | null
        }
        Insert: {
          default_limit?: number | null
          id?: string
          show_match_reason?: boolean | null
          updated_at?: string | null
        }
        Update: {
          default_limit?: number | null
          id?: string
          show_match_reason?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      smart_match_rules: {
        Row: {
          body_styles: string[] | null
          condition: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          label_en: string
          label_es: string | null
          lifestyle: string
          makes: string[] | null
          max_price: number | null
          min_price: number | null
          model_keywords: string[] | null
          priority: number | null
          trim_keywords: string[] | null
          updated_at: string | null
        }
        Insert: {
          body_styles?: string[] | null
          condition?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label_en: string
          label_es?: string | null
          lifestyle: string
          makes?: string[] | null
          max_price?: number | null
          min_price?: number | null
          model_keywords?: string[] | null
          priority?: number | null
          trim_keywords?: string[] | null
          updated_at?: string | null
        }
        Update: {
          body_styles?: string[] | null
          condition?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label_en?: string
          label_es?: string | null
          lifestyle?: string
          makes?: string[] | null
          max_price?: number | null
          min_price?: number | null
          model_keywords?: string[] | null
          priority?: number | null
          trim_keywords?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stores: {
        Row: {
          address: string | null
          brand: string | null
          city: string | null
          created_at: string
          dealer_group_id: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          service_phone: string | null
          service_schedule_url: string | null
          state: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          brand?: string | null
          city?: string | null
          created_at?: string
          dealer_group_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          service_phone?: string | null
          service_schedule_url?: string | null
          state?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          brand?: string | null
          city?: string | null
          created_at?: string
          dealer_group_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          service_phone?: string | null
          service_schedule_url?: string | null
          state?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_dealer_group_id_fkey"
            columns: ["dealer_group_id"]
            isOneToOne: false
            referencedRelation: "dealer_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          sort_order: number
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_images_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_pricing_history: {
        Row: {
          changed_at: string
          id: string
          new_price: number | null
          old_price: number | null
          vehicle_id: string | null
        }
        Insert: {
          changed_at?: string
          id?: string
          new_price?: number | null
          old_price?: number | null
          vehicle_id?: string | null
        }
        Update: {
          changed_at?: string
          id?: string
          new_price?: number | null
          old_price?: number | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_pricing_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          body_style: string | null
          condition: string | null
          created_at: string
          data_quality_score: number
          days_in_stock: number | null
          dealer_group_id: string | null
          dealer_name: string | null
          exterior_color: string | null
          has_images: boolean
          id: string
          image_count: number
          image_urls: Json | null
          import_key: string | null
          import_source: string | null
          imported_at: string | null
          interior_color: string | null
          internet_price: number | null
          inventory_provider: string
          is_active: boolean | null
          last_seen_at: string | null
          make: string | null
          mileage: number | null
          model: string | null
          msrp: number | null
          primary_image_url: string | null
          raw_data: Json | null
          sale_price: number | null
          source_feed_id: string | null
          source_raw: Json | null
          status: string
          stock_number: string | null
          store_id: string | null
          trim: string | null
          updated_at: string
          vin: string | null
          year: number | null
        }
        Insert: {
          body_style?: string | null
          condition?: string | null
          created_at?: string
          data_quality_score?: number
          days_in_stock?: number | null
          dealer_group_id?: string | null
          dealer_name?: string | null
          exterior_color?: string | null
          has_images?: boolean
          id?: string
          image_count?: number
          image_urls?: Json | null
          import_key?: string | null
          import_source?: string | null
          imported_at?: string | null
          interior_color?: string | null
          internet_price?: number | null
          inventory_provider?: string
          is_active?: boolean | null
          last_seen_at?: string | null
          make?: string | null
          mileage?: number | null
          model?: string | null
          msrp?: number | null
          primary_image_url?: string | null
          raw_data?: Json | null
          sale_price?: number | null
          source_feed_id?: string | null
          source_raw?: Json | null
          status?: string
          stock_number?: string | null
          store_id?: string | null
          trim?: string | null
          updated_at?: string
          vin?: string | null
          year?: number | null
        }
        Update: {
          body_style?: string | null
          condition?: string | null
          created_at?: string
          data_quality_score?: number
          days_in_stock?: number | null
          dealer_group_id?: string | null
          dealer_name?: string | null
          exterior_color?: string | null
          has_images?: boolean
          id?: string
          image_count?: number
          image_urls?: Json | null
          import_key?: string | null
          import_source?: string | null
          imported_at?: string | null
          interior_color?: string | null
          internet_price?: number | null
          inventory_provider?: string
          is_active?: boolean | null
          last_seen_at?: string | null
          make?: string | null
          mileage?: number | null
          model?: string | null
          msrp?: number | null
          primary_image_url?: string | null
          raw_data?: Json | null
          sale_price?: number | null
          source_feed_id?: string | null
          source_raw?: Json | null
          status?: string
          stock_number?: string | null
          store_id?: string | null
          trim?: string | null
          updated_at?: string
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_dealer_group_id_fkey"
            columns: ["dealer_group_id"]
            isOneToOne: false
            referencedRelation: "dealer_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_source_feed_id_fkey"
            columns: ["source_feed_id"]
            isOneToOne: false
            referencedRelation: "feed_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
