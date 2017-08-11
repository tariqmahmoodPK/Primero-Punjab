module Exporters
  class FormExporter

    def initialize(export_file=nil)
      @export_file_name = export_file || CleansingTmpDir.temp_file_name
      @io = File.new(@export_file_name, "w")
      @workbook = WriteExcel.new(@io)
    end

    def complete
      @workbook.close
      @io.close if !@io.closed?
      return @io
    end

    def export_file
      return  @export_file_name
    end

    # Exports forms to an Excel spreadsheet
    def export_forms_to_spreadsheet(type = 'case', module_id = 'primeromodule-cp', show_hidden = false)
      header = ['Form Group', 'Form Name', 'Field ID', 'Field Type', 'Field Name', 'Visible?', 'Required', 'On Mobile?', 'On Short Form?', 'Options', 'Help Text', 'Guiding Questions']

      primero_module = PrimeroModule.get(module_id)
      forms = primero_module.associated_forms_grouped_by_record_type(false)
      forms = forms[type]
      form_hash = FormSection.group_forms(forms)
      form_hash.each do |group, form_sections|
        form_sections.sort_by{|f| [f.order, (f.is_nested? ? 1 : -1)]}.each do |form|
          write_out_form(form, header, show_hidden)
        end
      end

      complete
    end

    def make_workbook_name_unique(workbook_name, idx=0)
      if @workbook.worksheets.find{|w| w.name.gsub(/\u0000/, "") == workbook_name}.nil?
        return workbook_name
      else
        idx += 1
        return modify_workbook_name(workbook_name, idx)
      end        
    end

    def modify_workbook_name(workbook_name, idx=0)
      letters_to_replace = Math.log10(idx).to_i + 1
      workbook_name.slice!((31-letters_to_replace)..30)
      workbook_name += idx.to_s
      return make_workbook_name_unique(workbook_name, idx)
    end

    def get_workbook_name(form)
      idx ||= 1
      workbook_name = "#{((form.name).gsub(/[^0-9a-z ]/i, ''))[0..30]}"
      return make_workbook_name_unique(workbook_name)
    end

    def write_out_form(form, header, show_hidden)
      if show_hidden || form.visible? || form.is_nested?
        # TODO: This should be probably some logging rather than puts?

        workbook_name = get_workbook_name(form)
        worksheet = @workbook.add_worksheet(workbook_name)
        worksheet.write(0, 0, form.unique_id)
        worksheet.write(1, 0, header)
        form.fields.each_with_index do |field, i|
          if show_hidden || field.visible?
            visible = field.visible? ? I18n.t("true") : I18n.t("false")
            required = field.required ? I18n.t("true") : I18n.t("false")
            options = ''
            if ['radio_button', 'select_box'].include?(field.type)
              if field.option_strings_source.present? && field.option_strings_source.start_with?('Location')
                options = 'Locations'
              else
                #TODO i18n
                options_list = field.options_list
                # If a list of strings, just display the strings. If specified as an object, display the display_text.
                options = options_list.map {|o| (o.is_a? String) ? o : o['display_text']}
                options = options.join(', ')
              end
            elsif field.type == 'subform'
              subform = field.subform_section
              options = "Subform: #{subform.name}"
              write_out_form(subform, header, show_hidden) rescue nil
            end
            field_type = field.type
            field_type += " (multi)" if field.type == 'select_box' && field.multi_select
            mobile_visible = ((form.visible || form.is_nested) && form.mobile_form && field.mobile_visible) ? 'Yes' : 'No'
            minify_visible = field.show_on_minify_form ? 'Yes' : 'No'
            worksheet.write((i+2),0,[form.form_group_name, form.name, field.name, field_type, field.display_name, visible, required, mobile_visible, minify_visible, options, field.help_text, field.guiding_questions])
          end
        end
      end
    end

  end
end